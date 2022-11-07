/*************
* @description : Excel file 업로드 시 Html Grid로 웹에 표시하는 컴포넌트
* @author : cogus1221@gmail.com
* @group : 
* @last modified on : 11-04-2022 
* @last modified by : cogus1221@gmail.com
**************/
import { LightningElement, api, track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import updateRecord from '@salesforce/apex/sheetComponentController.updateRecord';
import getSavedHtml from '@salesforce/apex/sheetComponentController.getSavedHtml';
import deleteRecord from '@salesforce/apex/sheetComponentController.deleteRecord';
import sheetjs from '@salesforce/resourceUrl/sheetjs';
import { readAsArrayBuffer } from './readFile';
import sheetComponentStyle from '@salesforce/resourceUrl/sheetComponentStyle';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from 'lightning/uiRecordApi';

export default class ExcelToGrid extends LightningElement {
    @api recordId;

    @track ready = false;

    version = "???";

    //1.페이지 로드 시 기존 데이터 불러오기 
    connectedCallback(){
        loadScript(this, sheetjs).then(()=>{
            this.version = XLSX.version;
            this.ready = true;
        })
        getSavedHtml({recordId: this.recordId})
        .then(savedHtml=>{
            if(!savedHtml){
                this.template.querySelector('.elementHoldingHTMLContent').innerHTML = '';
            } else {
                this.template.querySelector('.elementHoldingHTMLContent').innerHTML = savedHtml;
            }  
        })
        loadStyle(this, sheetComponentStyle).then(()=>{
            console.log('Style Loaded Successfully')
        }).catch(error=>{
            console.log('style loading error: ',error);
        })
    }

    //2.엑셀 파일 업로드 시
    /* Promise Chain for Uploading a new Excel File
        (1) Read File
        (2) Parse it & Extract the Excel cells & convert it into Html
        (3) insert Html to target location
        (4) save updated html code in a custom field
    */ 
    uploadFile(event){
        const recordId = this.recordId;
        let file;

        Promise.resolve(event.target.files)
        .then( files => {
            if(files.length !== 1){
                throw new Error("Error accessing file -- " + (files.length === 0 ? 'No file received' : 'Multiple Files received'))
            }
            file = files[0];
            return readAsArrayBuffer(file);
        })
        .then( blob => {
            let data = new Uint8Array(blob);
            let workbook = XLSX.read(data, {type: 'array'});
            let sheetName = '';

            workbook.SheetNames.forEach((data, idx) => {
                if(idx == 0){
                    sheetName = data;
                }
            })

            let convertedHtml = XLSX.utils.sheet_to_html(workbook.Sheets[sheetName], {header: ''});
            this.template.querySelector('.elementHoldingHTMLContent').innerHTML = convertedHtml;
            
            return updateRecord({recordId: recordId, html: convertedHtml}).then(()=> data);
        })
        .then((data)=>{
            let binary = '';
            const len = data.byteLength;
            
            for(let i = 0; i < len; i++){
                binary += String.fromCharCode(data[i]);
            }

            const cv = {
                Title: file.name,
                PathOnClient: file.name,
                VersionData: window.btoa(binary),
                FirstPublishLocationId: recordId
            };

            return createRecord({apiName: "ContentVersion", fields: cv});
        })
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Excel Upload: Success',
                    message: 'New datatable has been updated successfully and the Excel file uploaded',
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            console.log('error! : ', error);
        })
    }

    //3. 테이블 삭제 버튼 클릭 시 logic
    deleteHtml(){
        deleteRecord({recordId: this.recordId})
        .then(()=>{
            this.template.querySelector('.elementHoldingHTMLContent').innerHTML = '';

            const toastEvent = new ShowToastEvent({
                title: 'Grid Deleted',
                message: 'Grid has deleted successfully.',
                variant: 'success'
            });
            this.dispatchEvent(toastEvent);
        })
    }
}