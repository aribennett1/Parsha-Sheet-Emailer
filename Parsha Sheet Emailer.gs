function main() {
  var d = new Date();  
  var hebrewDate = getHebrewDate(d);
  const hebrewMonth = hebrewDate.get("Month");
  const hebrewDay = hebrewDate.get("Day");
  const hebrewYear = hebrewDate.get("Year");
  if (hebrewMonth == "Cheshvan") {
    PropertiesService.getScriptProperties().deleteAllProperties();
  }
  var parsha = [];
  var holiday = "";
  var hebcal = getHebcal(d);
  var thisWeeksParsha = hebcal.items.find(item => item.title.includes("Parshas "));
  if (thisWeeksParsha) {
    var thisWeeksParsha = thisWeeksParsha.title.replaceAll("Parshas ", "").replaceAll("Sazria", "Tazria")
    if (thisWeeksParsha.includes("-") && thisWeeksParsha != "Lech-Lecha") {
      parsha = thisWeeksParsha.split("-");
    }
    else {
      parsha.push(thisWeeksParsha);
    }
  }
  if (hebcal.items.find(item => item.title.includes("Simchas Torah"))) {
    if (PropertiesService.getScriptProperties().getProperty(`V'Zos Habracha${hebrewYear}`) != "sent") {
      PropertiesService.getScriptProperties().setProperty(`V'Zos Habracha${hebrewYear}`, "sent");
      parsha.push("V'Zos Habracha");
    }
  }
  holiday = getHoliday(hebrewMonth, hebrewDay, hebrewYear);
  if (parsha.length != 0 || holiday != "") {
    emailSheet(parsha, holiday);
  }
  else {
    console.log("Nothing to email this week");
  }
}

function getHoliday(month, day, year) {
  var holiday = "";
  month = String(month);
  if (month == "Elul" && day >= 20) {
    holiday = "Rosh Hashanah/Yom Kippur";
  }
  else if (month == "Tishrei" && day >= 5) {
    holiday = "Sukkos";
  }
  else if (month == "Kislev" && day >= 15) {
    holiday = "Chanukah";
  }
  else if ((month.startsWith("Adar") && month != 'Adar I') && day >= 4) {
    holiday = "Megillah"
  }
  else if (month == "Nissan" && day >= 5) {
    holiday = "Haggadah";
  }
  else if ((month == "Iyar" && day >= 26) || (month == "Sivan" && day <= 6)) {
    holiday = "Rus";
  }

  if (holiday != "") {
    var property = holiday + year;
    if (PropertiesService.getScriptProperties().getProperty(property) != "sent") {
      PropertiesService.getScriptProperties().setProperty(property, "sent");
    }
    else {
      holiday = "";
    }
  }
  return holiday;
}

function getHebcal(todaysDate) {
  return JSON.parse(UrlFetchApp.fetch(`https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=off&nx=off&start=${getDate(todaysDate)}&end=${getDate(addDays(todaysDate, 10))}&ss=off&lg=a&mf=off&c=off&M=off&s=on`).getContentText());
}

function getHebrewDate(d) {
  var month = (d.getMonth() + 1).toString().padStart(2, '0');
  var day = d.getDate().toString().padStart(2, '0');
  var hebcal = JSON.parse(UrlFetchApp.fetch(`https://www.hebcal.com/converter?cfg=json&gy=${d.getFullYear()}&gm=${month}&gd=${day}&g2h=1`).getContentText());
  var hebrewMonth = hebcal.hm;
  hebrewMonth = hebrewMonth.replaceAll("Nisan", "Nissan").replaceAll("Iyyar", "Iyar").replaceAll("Tevet", "Teves").replaceAll("Sh'vat", "Shvat");
  const hebrewDate = new Map();
  hebrewDate.set("Month", hebrewMonth);
  hebrewDate.set("Day", hebcal.hd);
  hebrewDate.set("Year", hebcal.hy);
  return hebrewDate;
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
  console.log("Subject: " + subject);
  for (var file in attachments) {
    console.log(attachments[file].getName());
  }
  GmailApp.sendEmail([EMAIL REMOVED], subject, "",{
        from: "aribennett1@gmail.com",
        attachments: attachments,
        name: "Ari Bennett"
      });

  console.log(`RemainingDailyQuota: ${MailApp.getRemainingDailyQuota()}`);
}
