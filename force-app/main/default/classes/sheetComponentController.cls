/**
 * @description       : 
 * @author            : cogus1221@gmail.com
 * @group             : 
 * @last modified on  : 11-04-2022
 * @last modified by  : cogus1221@gmail.com
**/
public with sharing class sheetComponentController {
    @AuraEnabled
    public static void updateRecord(Id recordId, String html){
        Excel_to_Grid__c excelGridRec = [SELECT Id, sheet_to_html__c FROM Excel_to_Grid__c WHERE Id =: recordId];
        excelGridRec.sheet_to_html__c = html;
        update excelGridRec;
    }
 
    @AuraEnabled
    public static String getSavedHtml(Id recordId){
        Excel_to_Grid__c savedRec = [SELECT Id, sheet_to_html__c FROM Excel_to_Grid__c WHERE Id =: recordId];
        return savedRec.sheet_to_html__c;
    }

    @AuraEnabled
    public static void deleteRecord(Id recordId){
        Excel_to_Grid__c deletingRec = [SELECT Id, sheet_to_html__c FROM Excel_to_Grid__c WHERE Id =: recordId];
        deletingRec.sheet_to_html__c = '';
        update deletingRec;
    }
}
