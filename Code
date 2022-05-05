function main() {
  var d = new Date();
  // PropertiesService.getScriptProperties().deleteAllProperties();
  var year = d.getFullYear();
  var hebcal = getHebcal(d);
  var parsha = [];
  var holiday = "";
  // console.log(hebcal);
  if (hebcal.includes("Parshas ")) {
    var thisWeeksParsha = getParsha(hebcal);
    if (thisWeeksParsha.includes("-") && thisWeeksParsha != "Lech-Lecha") {
      thisWeeksParsha = thisWeeksParsha.split("-");
      parsha.push(thisWeeksParsha[0]);
      parsha.push(thisWeeksParsha[1]);
    }
    else {
      parsha.push(thisWeeksParsha);
    }
  }
  if (hebcal.includes("Simchas Torah")) {
    if (PropertiesService.getScriptProperties().getProperty("V'Zos Habracha"+year) != "sent") {
      PropertiesService.getScriptProperties().setProperty("V'Zos Habracha"+year, "sent");
      parsha.push("V'Zos Habracha");
    }
  }  
  for (var par in parsha) {
    console.log(`parsha: ${parsha[par]}`);
  } 
  if (hebcal.includes("\"category\":\"holiday")) {    
    holiday = getHoliday(hebcal, year);
  }
  if (holiday != "") {
    console.log(`holiday: ${holiday}`);
  }
  if (parsha.length != 0 || holiday != "") {
    emailSheet(parsha, holiday);
  }
  else {
    console.log("Nothing to email this week");
  }
}

function getParsha(hebcal) {
hebcal = hebcal.substring(hebcal.indexOf("Parshas ") + 8);
hebcal = hebcal.substring(0, hebcal.indexOf("\",\"date\""));
return hebcal.replaceAll("Sazria","Tazria");
}

function getHoliday(hebcal, year) {
  var index = hebcal.indexOf("\"category\":\"holiday");
  for (var i = index; i > 0; i--) {
    if (hebcal.charAt(i) == "{") {
      index = i;
      break;
    }
  }
  hebcal = hebcal.substring(index);
  hebcal = hebcal.substring(hebcal.indexOf("title\":\"") + 8);
  hebcal = hebcal.substring(0, hebcal.indexOf("\",\"date\""));
  hebcal = hebcal.replaceAll("Erev ", "");
  if (hebcal === "Shavuos" || hebcal === "Pesach" || hebcal === "Purim") {
    var property = hebcal+year;
    // console.log(`property: ${property}`);
    if (PropertiesService.getScriptProperties().getProperty(property) != "sent") {
      PropertiesService.getScriptProperties().setProperty(property, "sent");
    }
    else {
    hebcal = "";
    }
  }
  else {
    hebcal = "";
  }
  return hebcal;
}

function getHebcal(todaysDate) {
  var today = getDate(todaysDate);
  var nextWeekDate = addDays(todaysDate, 10);
  var nextWeek = getDate(nextWeekDate);
  var hebcal = UrlFetchApp.fetch(`https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=off&nx=off&start=${today}&end=${nextWeek}&ss=off&lg=a&mf=off&c=off&M=off&s=on`);
  return hebcal.getContentText();
}

function getDate(d) {
  var day = d.getDate();
  day = addLeadingZeroIfLenIsOne(day);
  let month = d.getMonth() + 1;
  month = addLeadingZeroIfLenIsOne(month);
  let year = d.getFullYear();
  var date = `${year}-${month}-${day}`;
  // console.log(`date: ${date}`);
  return date;
}

function addLeadingZeroIfLenIsOne(num) {
if (num.toString().length == 1) {
    num = "0" + num;
  }
  return num;
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function emailSheet(parsha, holiday) {
  var attachments = [];
  var subject = "";
  if (parsha.length == 1) {
    subject = `Parsha Questions - ${parsha[0]}`;
  }
  if (parsha.length == 2) {
    subject = `Parsha Questions - ${parsha[0]}/${parsha[1]}`;
  }
switch (holiday) {
  case "Shavuos":
    holiday = "Rus";
    break;
  case "Pesach":
    holiday = "Haggadah";
    break;
  case "Purim":
     holiday = "Megillah";
    break;
  default:
    holiday = "";
}
if (holiday != "") {
  parsha.push(holiday);
  if (subject != "") {
    subject = `${subject} & ${holiday}`;
  }
  else {
    subject = `${holiday} Questions`;
  }
}
  var folders = DriveApp.getFoldersByName(""); //enter the name of Google Drive folder
  var files = folders.next().getFiles();
  while (files.hasNext()) {
    var file = files.next();
    for (var name in parsha) {
      if (file.getName().includes(parsha[name])) {
        // console.log("Pushing file: " + (file.getName()));
        attachments.push(file);
      }
    }
    if (attachments.length == parsha.length) {
      break;
    }
  }
  for (var file in attachments) {
    console.log(attachments[file].getName());
  }
  GmailApp.sendEmail(Session.getActiveUser().getEmail(), subject, "",{
        attachments: attachments
      });
}
