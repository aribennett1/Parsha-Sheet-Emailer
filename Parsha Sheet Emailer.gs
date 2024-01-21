function main() {  
  var d = new Date();
  if (d.getFullYear() != PropertiesService.getScriptProperties().getProperty("thisYear")) {
  PropertiesService.getScriptProperties().deleteAllProperties();
  PropertiesService.getScriptProperties().setProperty("thisYear", d.getFullYear());
  }
  var year = d.getFullYear();  
  var parsha = [];
  var holiday = "";
  var hebcal = getHebcal(d);
  var thisWeeksParsha = hebcal.items.find(item => item.title.includes("Parshas "));
  if (thisWeeksParsha) {
    var thisWeeksParsha = thisWeeksParsha.title.replaceAll("Parshas ", "").replaceAll("Sazria","Tazria")
    if (thisWeeksParsha.includes("-") && thisWeeksParsha != "Lech-Lecha") {
      parsha = thisWeeksParsha.split("-");
    }
    else {
      parsha.push(thisWeeksParsha);
    }
  }
  if (hebcal.items.find(item => item.title.includes("Simchas Torah"))) {
    if (PropertiesService.getScriptProperties().getProperty(`V'Zos Habracha${year}`) != "sent") {
      PropertiesService.getScriptProperties().setProperty(`V'Zos Habracha${year}`, "sent");
      parsha.push("V'Zos Habracha");
    }
  }  
  var holiday = hebcal.items.find(item => item.category.includes("holiday"));
  if (holiday) {    
    holiday = getHoliday(holiday.title, year);
  }
  if (parsha.length != 0 || holiday != "") {
    emailSheet(parsha, holiday);
  }
  else {
    console.log("Nothing to email this week");
  }
}

function getHoliday(title, year) {  
  title = title.replaceAll("Erev ", "");
  if (title === "Shavuos" || title === "Pesach" || title === "Purim") {
    var property = title+year;
    PropertiesService.getScriptProperties().getProperty(property) != "sent" ?
      PropertiesService.getScriptProperties().setProperty(property, "sent") : title = "";   
  }
  else {
    title = "";
  }
  return title;
}

function getHebcal(todaysDate) {
  return JSON.parse(UrlFetchApp.fetch(`https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=off&nx=off&start=${getDate(todaysDate)}&end=${getDate(addDays(todaysDate, 10))}&ss=off&lg=a&mf=off&c=off&M=off&s=on`).getContentText());
}

const getDate = d => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;

const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

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
  var folders = DriveApp.getFolderById("1ihDno5us7sLY6NH5fmqORPuplD8Uz_66");
  var files = folders.getFiles();
  var file;
  while (files.hasNext()) {
    file = files.next();
    for (var name in parsha) {
        if (file.getName().includes(parsha[name])) {
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
  GmailApp.sendEmail("[EMAIL REMOVED]", subject, "",{
        from: "aribennett1@gmail.com",
        attachments: attachments,
        name: "Ari Bennett"
      });
}
