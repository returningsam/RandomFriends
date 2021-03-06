const placeholders = [
    "http://myfriend.rocks",
    "http://friendsarethe.best",
    "http://thisfriendis.cool"
];

const frownFace = "&#9785;";
const smileFace = "&#9786;";
const neutrFace = "&#128528;";

var handleInputTypeTimeout;
var currentLink;

function validURL(str,validLinks) {
    var reason = "All good!";
    if (typeof validate({website:str}, {website: {url: true}}) != "undefined")
        reason = "Link is invalid, please check it again.";
    else if (validLinks.indexOf(str) > -1) reason = "Duplicate link!";
    result = (reason == "All good!");
    return {result:result,reason:reason};
}

function goToFriend() {
    var urls = window.location.href.split("?")[1].replace("links=","").split(",");
    var fLink = decodeURIComponent(urls.splice(chance.integer({min:0,max:urls.length-1}),1)[0]);
    document.getElementById("apiLink").href = fLink;
    document.getElementById("apiLink").click();
}

function checkQuery() {return (window.location.href.indexOf("?links=") > -1);}

var autoFilled = false;
var autoFillTimeout;
function attemptAutoFill(ev) {
    if (autoFillTimeout) clearTimeout(autoFillTimeout);
    autoFillTimeout = setTimeout(function () {
        var inputEl = ev.target;
        if (inputEl.value.length < 1) return;
        if (autoFilled) return;
        if (!RegExp(/^(https:\/\/|http:\/\/)+/).test(inputEl.value)) {
            if ("https://".indexOf(inputEl.value) > -1 || "http://".indexOf(inputEl.value) > -1)
                inputEl.value = "http://";
            else inputEl.value = "http://" + inputEl.value;
            autoFilled = true;
        }
    }, 300);
}

function checkInputs() {
    var inputs = document.getElementsByTagName("input");
    if (inputs.length > 0)
        document.getElementById("clearButton").classList.remove("hidden");
    else document.getElementById("clearButton").classList.add("hidden");
    var validLinks = [];
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].value.length < 1 && inputs[i] !== document.activeElement) {
            inputs[i].parentNode.parentNode.removeChild(inputs[i].parentNode);
            i--;
        }
        else {
            var validity = validURL(inputs[i].value,validLinks);
            if (validity.result) {
                validLinks.push(inputs[i].value);
                inputs[i].parentNode.getElementsByClassName("status")[0].innerHTML = smileFace;
            }
            else inputs[i].parentNode.getElementsByClassName("status")[0].innerHTML = frownFace;
            inputs[i].parentNode.getElementsByClassName("status")[0].title = validity.reason;
        }
    }
    if (validLinks.length > 0)
        document.getElementById("createButton").classList.remove("hidden");
    else document.getElementById("createButton").classList.add("hidden");

    return validLinks;
}

function handleInputType(ev) {
    if (handleInputTypeTimeout) clearTimeout(handleInputTypeTimeout);
    handleInputTypeTimeout = setTimeout(checkInputs, 10);
}

function handleDeleteListItem(ev) {
    var toDel = ev.target.parentNode;
    toDel.parentNode.removeChild(toDel);
}

function handleAddListItem() {
    var list = document.getElementById("list");
    var newLI = newListItem()
    list.appendChild(newLI);
    newLI.getElementsByTagName("input")[0].focus();
    checkInputs()
}

function clearListItems() {
    var inputs = document.getElementsByTagName("input");
    while (inputs.length > 0)
        inputs[0].parentNode.parentNode.removeChild(inputs[0].parentNode);
    checkInputs();
}

function newListItem() {
    var listItem = document.createElement("div");
    listItem.classList.add("listItem");

    var inp = document.createElement("input");
    inp.type = "url";
    inp.autocomplete = "on";
    inp.placeholder = placeholders[chance.integer({min:0,max:placeholders.length-1})];
    inp.addEventListener("input",handleInputType);
    inp.addEventListener("input",attemptAutoFill);
    inp.addEventListener("keypress",function (ev) {
        if (ev.key == "Enter") handleAddListItem();
    });
    listItem.appendChild(inp);

    var status = document.createElement("p");
    status.classList.add("status");
    status.innerHTML = neutrFace;
    listItem.appendChild(status);
    return listItem;
}

function fixLinkWidth() {
    var linkText = document.getElementById("link");
    var right = document.getElementsByClassName("right")[0];
    linkText.parentNode.style.maxWidth = (right.clientWidth - 100) + "px";
}

function generateLink() {
    var links = checkInputs();
    if (links.length > 0) {
        var currentLink = "https://samkilg.us/friends/?links=";
        for (var i = 0; i < links.length; i++)
            links[i] = encodeURIComponent(links[i]);
        currentLink += links.join(",");
        var linkText = document.getElementById("link");
        linkText.parentNode.parentNode.classList.remove("hidden");
        linkText.innerHTML = currentLink;
        fixLinkWidth();
        this.innerHTML = "update link";
    }
    else {console.log("no links entered")}
}

function init() {
    if (checkQuery()) goToFriend();
    else {
        document.title = "Random Friends";
        document.body.style.display = "inherit";
        document.getElementById("addButton").addEventListener("click",handleAddListItem);
        document.getElementById("createButton").addEventListener("click",generateLink);
        document.getElementById("clearButton").addEventListener("click",clearListItems);
        new ClipboardJS("#copyButton",{text: function(trigger) {
            trigger.innerHTML = "copied!";
            trigger.classList.add("copied");
            setTimeout(function () {
                trigger.innerHTML = "copy";
                trigger.classList.remove("copied");
            }, 3000);
            return document.getElementById("link").innerHTML;
        }});
    }
}

window.onload = init;
window.onresize = fixLinkWidth;
