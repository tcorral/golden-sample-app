import '@angular/localize/init';

export const ACH_POSITIVE_PAY_TRANSLATIONS = {
  rulesSubmittedSuccessfully: $localize`:Notification Message - 'New rule created successfully.'|This string is used as a notification message to inform the user that a new ACH rule has been successfully created. It is presented to the user after they submit a new ACH rule form. This message is located in the notification area of the application.@@ach-positive-pay.notification.message:New rule created successfully.`,
  creditPaymentType: $localize`:Credit Payment Type - 'Credit'|This string is used as a label and value for the Payment Type field in the ACH Positive Pay new rule form. It is presented to the user when they need to select the payment type as Credit. This label is located in the ACH Positive Pay new rule form layout.@@ach-positive-pay.new-rule-form.payment-type.credit:Credit`,
  debitPaymentType: $localize`:Debit Payment Type - 'Debit'|This string is used as a label and value for the Payment Type field in the ACH Positive Pay new rule form. It is presented to the user when they need to select the payment type as Debit. This label is located in the ACH Positive Pay new rule form layout.@@ach-positive-pay.new-rule-form.payment-type.debit:Debit`,
};
