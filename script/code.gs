// menu added on open
function onOpen() {
  FormApp.getUi() // Or DocumentApp or FormApp.
      .createMenu('Settings') 
      .addItem('Authorize Email', 'authorize')  
      .addItem('Email Notifications', 'setEmailInfo')   
      .addToUi();
}



//function to put it all together
function onFormSubmit(e){

  var response = e.response;
  var title = FormApp.getActiveForm().getTitle();
  var respondentEmail = response.getRespondentEmail();
  var weekNumber = getWeekNumber();
  var emailSubject =  title  + ' from ' + respondentEmail + ' (Week ' + weekNumber + ')';
  var message = 'This is the ' + title + ' submitted by ' + respondentEmail;
  var secHeader = true;
  var body;  
  
  // Check if the form is the final version 
  
  if (isfinal(response)) 
  {
    var userEmail = getProperty('EMAIL_ADDRESS');
    var message = 'This is the ' + title + ' submitted by ' + respondentEmail +' on '+ response.getTimestamp();
  } 
  
  else 
    
  {

   var userEmail = respondentEmail;
   var message = 'You submitted a draft on ' +  response.getTimestamp() + ' you may continue editing from the ' +  '<a href='+ response.getEditResponseUrl() +'> form draft </a>';   
    
  }
    
     
    //get questions and responses
    
   var resp = getResponse(response, secHeader); 
    
    //format with html
    
   var msgBodyTable = formatHTML(resp);  
    
    //email
   body = message +  msgBodyTable;  
    
  sendEmail(userEmail,emailSubject,title, body); 
 
}



//
// Check if the version is final 
//

function isfinal(response)
{
 
  var itemRes = response.getItemResponses();
  
  // A Flag to check if it is the final version 
  finalVersionFlag =  false ;
  
   for (var i = 0; i < itemRes.length; i++) {
    var itemTitle = itemRes[i].getItem().getTitle();
    var itemType = itemRes[i].getItem().getType();
    var itemResponse = itemRes[i].getResponse();
    
   // Logger.log(itemTitle + '('  + itemType + '): ' + JSON.stringify(itemResponse));
     
     if (itemType == "CHECKBOX")
    {
      if (itemResponse[0] == 'final version') 
      {
            finalVersionFlag =  true ;
      }    
     }
    
   }
   
  Logger.log(finalVersionFlag);
  return finalVersionFlag;
} 




//
//Function get form items and form responses. Builds and and returns an array of quesions: answer.
//


function getResponse(response,secHeader){
  var form = FormApp.getActiveForm();
  var items = form.getItems();
  var itemRes = response.getItemResponses();
  var array = []; 

  for (var i = 0; i < items.length; i++){
    var question = items[i].getTitle();   
    var answer = "";
  
    //include section headers and description in email only runs when user sets setHeader to true
    
      if (items[i].getType() == "SECTION_HEADER" && secHeader == true)
      {
        var description = items[i].getHelpText();
        var title = items[i].getTitle();
        var regex = /^\s*(?:[\dA-Z]+\.|[a-z]\)|•)\s+/gm;
        description = description.replace(regex,"<br>");
        array.push('<p style="font-family:Arial, sans-serif;font-size:18px;font-weight:bold">' + title + '</p>');
        continue;
      }
    
    //loop through to see if the form question title and the response question title matches. If so push to array, if not answer is left as ""
    
    for (var j = 0; j < itemRes.length; j++){ 
      var respQuestion = itemRes[j].getItem().getTitle();
    
      if (question == respQuestion){
      
        if(items[i].getType() == "CHECKBOX"){
          var answer =  formatCheckBox(itemRes[j].getResponse());
          break;
        }
        else{
        var answer = itemRes[j].getResponse().replace(/(\n)+/g, '<br>');
          
        break;
        }
      } 
    }

    array.push('<table style="border-collapse:collapse;border-spacing:0;border-color:#aaa;border-width:0px;border-style:solid;width:100%"><tr><td style="font-family:Arial, sans-serif;font-size:14px;font-weight:bold;padding:10px 5px;text-align: left;border-style:solid;border-width:0px;overflow:hidden;word-break:normal;border-color:#aaa;color:#333333;background-color:#ffffff" colspan="2">' + question + '</td></tr><tr><td style="font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:0px;overflow:hidden;word-break:normal;border-color:#aaa;color:#333;background-color:#fff;width:3%">&nbsp;</td><td style="font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:0px;overflow:hidden;word-break:normal;border-color:#aaa;color:#333;background-color:#d4d4d4;width:97%">' + answer + '</td></tr></table>');    
  }

  return array;
}


//
// Format Checkbox answer as html item 
//

function formatCheckBox(chkBoxArray){

   for (var i = 0; i < chkBoxArray.length; i++){
     chkBoxArray[i] = "<br>" + chkBoxArray[i];
   }

  return chkBoxArray.join(" ");

}

//
//formats an array as a table
//

function formatHTML(array){
  
  var style = '<style type="text/css"> .tftable {font-size:12px;color:#333333;width:100%;border-width: 1px;border-color: #9dcc7a;border-collapse: collapse;} .tftable th {font-size:12px;background-color:#abd28e;border-width: 1px;padding: 8px;border-style: solid;border-color: #9dcc7a;text-align:left;} .tftable tr {background-color:#bedda7;} .tftable td {font-size:12px;border-width: 1px;padding: 8px;border-style: solid;border-color: #9dcc7a;} </style>';
  var tableStart = "<br><br><html><body>" + style + "<table border=\"0\">";
  var tableEnd = "</table></body></html>";
  var rowStart = "<tr>";
  var rowEnd = "</tr>";
  var cellStart = "<td>";
  var cellEnd = "</td>";

   for (i in array){
     array[i] = rowStart + cellStart + array[i] + cellEnd + rowEnd;
     }

  array  = array.join('');
  array = tableStart + array + tableEnd;

  return array;
}


//
//function to send out mail
//

function sendEmail(emailRecipient,emailSubject,title,body){

  MailApp.sendEmail(emailRecipient,emailSubject,"", {name: title , noReply: true, htmlBody: body});

}

