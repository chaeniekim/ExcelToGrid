/**
 * @description       : 
 * @author            : cogus1221@gmail.com
 * @group             : 
 * @last modified on  : 11-02-2022
 * @last modified by  : cogus1221@gmail.com
**/
public with sharing class sheetComponentController {
    @AuraEnabled
    public static void updateRecord(Id recordId, String html){
        System.debug('arg ========> '+ recordId + ', ' + html);
        Excel_to_Grid__c excelGridRec = [SELECT Id, sheet_to_html__c FROM Excel_to_Grid__c WHERE Id =: recordId];
        
        System.debug('result =========>' + excelGridRec);

        excelGridRec.sheet_to_html__c = html;
        System.debug('result =========>' + excelGridRec);

        update excelGridRec;
    }

    @AuraEnabled
    public static String getSavedHtml(Id recordId){
        Excel_to_Grid__c savedRec = [SELECT Id, sheet_to_html__c FROM Excel_to_Grid__c WHERE Id =: recordId];
        System.debug('savedRec==========>' + savedRec.sheet_to_html__c);

        return savedRec.sheet_to_html__c;
    }

    @AuraEnabled
    public static void deleteRecord(Id recordId){
        Excel_to_Grid__c deletingRec = [SELECT Id, sheet_to_html__c FROM Excel_to_Grid__c WHERE Id =: recordId];

        deletingRec.sheet_to_html__c = '';

        update deletingRec;
    }
}
