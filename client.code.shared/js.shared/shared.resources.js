var App = App || {};

App.Media = {
  "helpicon" : App.rootStatic + "img/help.png",
  "non-answered.icon" : App.rootStatic + "img/orange-icon.png",
  "ok.icon" : App.rootStatic + "img/green-ok-icon.png",
  "error.icon" : App.rootStatic + "img/red-cross-icon.png",
};

App.Steps = {
  "1" : new Classes.ResStep("Demografic info.", "We can make a variety of inferences based on the information about who you are and what you like. During the next step, you'll be asked to fill out a questionnaire about your age, gender, web browsing behavior and other demographic details."),
  "2" : new Classes.ResStep("Research input. Brand Attitude.", "What you think about a brand affects what you think about brand-related things. During the next step, you'll be asked to rate several eCommerce brands. We're predominantly interested in your personal 'gut feeling' about the brands."),
  "3" : new Classes.ResStep("Research input. Website Attitude and Visual Impression.", "This is the main phase of study. During the next step, you'll be asked to rate webpages of eCommerce websites and then eCommerce websites themselves. We're, again, predominantly interested in your personal feeling about webpages and websites."),
  "4" : new Classes.ResStep("Results and further info.", "Congratulations! The test is over. The next screen will simply show you the list of websites used in this study. Feel free to visit them at your convenience.")
};

App.Questions = {
  "brand.familiarity" : new Classes.ResQuestion("brand.familiarity", "How well do you know {brandName}?", 7, "Never heard of it", "Know very well"),
  "value.for.money" : new Classes.ResQuestion("value.for.money", "{brandName} is good value for money.", 7, "Not at all", "Absolutely yes"),
  "respect" : new Classes.ResQuestion("respect", "{brandName} is a well respected brand.", 7, "Not at all", "Absolutely yes"),
  "have.things" : new Classes.ResQuestion("have.things", "People like me having {brandName}.", 7, "Not at all", "Absolutely yes"),
  "liking" : new Classes.ResQuestion("liking", "How much do you like this webpage?", 7, "Didn't like at all", "Very much"),
  "goodness" : new Classes.ResQuestion("goodness", "How good is this webpage?", 7, "Not good at all", "Very good"),
  "attractiveness" : new Classes.ResQuestion("attractiveness", "How attractive is this webpage?", 7, "Not attractive at all", "Very attractive"),
  "trust1" : new Classes.ResQuestion("trust1", "I can trust {websiteName}.", 7, "Not at all", "Absolutely yes"),
  "trust2" : new Classes.ResQuestion("trust2", "I trust the information presented on {websiteName}.", 7, "Not at all", "Absolutely yes"),
  "trust3" : new Classes.ResQuestion("trust3", "I would entrust credit card transactions to {websiteName}.", 7, "Not at all", "Absolutely yes"),
  "loyalty1" : new Classes.ResQuestion("loyalty1", "I would consider purchasing from {websiteName} in the future.", 7, "Not at all", "Absolutely yes"),
  "loyalty2" : new Classes.ResQuestion("loyalty2", "I want to visit {websiteName} again.", 7, "Not at all", "Absolutely yes"),
  "loyalty3" : new Classes.ResQuestion("loyalty3", "I would consider using {websiteName} in the future.", 7, "Not at all", "Absolutely yes"),
  "loyalty4" : new Classes.ResQuestion("loyalty4", "I would recommend {websiteName} to my friends.", 7, "Not at all", "Absolutely yes")
};

App.Constructs = {
  "attractiveness" : new Classes.ResConstruct("attractiveness", "'Attractiveness' corresponds to your impression of how beautiful/ugly a webpage is", [App.Questions["attractiveness"]]),
  "goodness" : new Classes.ResConstruct("goodness", "'Goodness' corresponds to your feeling of how good/bad a webpage is", [App.Questions["goodness"]]),
  "liking" : new Classes.ResConstruct("liking", "'Liking' corresponds to how much you like a webpage", [App.Questions["liking"]]),
  "brand.attitude" : new Classes.ResConstruct("brand.attitude", "'Brand attitude' corresponds to how much you like and respect the brand", [App.Questions["brand.familiarity"], App.Questions["value.for.money"], App.Questions["respect"], App.Questions["have.things"]]),
  "website.trust" : new Classes.ResConstruct("website.trust", "'Website trust' corresponds to your subjective feeling of how trustful and reliable a website is", [App.Questions["trust1"], App.Questions["trust2"], App.Questions["trust3"]]),
  "website.loyalty" : new Classes.ResConstruct("website.loyalty", "'Website loaylty' corresponds to your intention to stick to a website for long time and don't switch to its rivals", [App.Questions["loyalty1"], App.Questions["loyalty2"], App.Questions["loyalty3"], App.Questions["loyalty4"]])
};

App.DemographicsFields = {
  "sex" : {
    help : "What is your gender.",
    question : "Your sex"
  },
  "age" : {
    help : "What is your current age?",
    question : "Your age"
  },
  "vision" : {
    help : "Can you see all colors?",
    question : "Color vision"
  },
  "residence" : {
    help : "The country you live in and/or associate yourself with",
    question : "Country of residence",
    options : ["Afghanistan", "Åland Islands", "Albania", "Algeria", "American Samoa", "AndorrA", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Congo, The Democratic Republic of the", "Cook Islands", "Costa Rica", "Cote D\"Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and Mcdonald Islands", "Holy See (Vatican City State)", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran, Islamic Republic Of", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, Democratic People\"S Republic of", "Korea, Republic of", "Kuwait", "Kyrgyzstan", "Lao People\"S Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libyan Arab Jamahiriya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia, The Former Yugoslav Republic of", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova, Republic of", "Monaco", "Mongolia", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestinian Territory, Occupied", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation", "RWANDA", "Saint Helena", "Saint Kitts and Nevis", "Saint Lucia", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia and Montenegro", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "Spain", "Sri Lanka", "Sudan", "Suriname", "Svalbard and Jan Mayen", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan, Province of China", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Viet Nam", "Virgin Islands, British", "Virgin Islands, U.S.", "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"]
  },
  "occupation" : {
    help : "What is the main area you've been studying/working in?",
    question : "Area you study/work in",
    options : ["Accounting", "Advertising/PR", "Arts/Entertainment", "Business Services", "Buying/Retail", "Computer Science/IT", "Consulting", "Design/Architecture", "Education/Training", "Engineering", "Financial Services", "Government", "Health Care", "Hospitality/Event Planning", "Human Resources", "Investments/Banking", "Legal Services", "Management/Administration", "Marketing/Market Research", "Media/Publishing", "Non-Profits", "Sales/Real Estate", "Science/Research", "Social Services", "Sports/Recreation", "Other"]
  },
  "onlinebuying" : {
    help : "Should be self-explanatory...",
    question : "How much you spend a month for buying goods online (in $)",
    options : ["0", "1-50", "51-100", "101-200", "201-500", "501-1000", ">1001"]
  },
  "webuse" : {
    help : "How many hours a day you actively browse the Internet?",
    question : "How many hours you spend online per day",
    options : ["0-0.5", "0.5-1", "1-2", "2-5", "5-10", ">10"]
  }
};
