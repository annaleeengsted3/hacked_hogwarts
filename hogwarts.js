"use strict";

window.addEventListener("DOMContentLoaded", init);

let allStudents = [];
let currentStudents = [];
let house = "all";
let sortButton;
let expelledStudents = [];

function init() {
  console.log("ready");
  //Add eventlisteners- to do: consider making one big clickController for all
  document.querySelectorAll(".filter").forEach(elm => {
    elm.addEventListener("click", setFilter);
  });
  document.querySelectorAll(".sort").forEach(elm => {
    elm.addEventListener("click", setSort);
  });

  document.querySelector("#randomize").addEventListener("click", randomize);
  document.querySelector("#list").addEventListener("click", listClickController);

  loadJSON();
}

////////////// DATA LOAD: ////////////////////

function loadJSON() {
  fetch("http://petlatkea.dk/2019/hogwartsdata/students.json")
    .then(response => response.json())
    .then(jsonData => {
      loadSecondDataJSON(jsonData);
    });
}

function loadSecondDataJSON(jsonData) {
  fetch("http://petlatkea.dk/2019/hogwartsdata/families.json")
    .then(response => response.json())
    .then(jsonBloodStatusData => {
      prepareObjects(jsonData, jsonBloodStatusData);
    });
}

////////////// DATA LOAD: ////////////////////

////////////// BLOOD STATUS CHECK + SET: ////////////////////
function compareBloodstatus(lastName, jsonBloodStatusData) {
  // let halfBloods = jsonBloodStatusData.half;
  //Here halfbloods will count as mudbloods. For each lastName sent here, check purebloods list (forEach purebloods names)
  let pureBloods = jsonBloodStatusData.pure;
  let pure;
  let last_name = lastName;
  pureBloods.forEach(function(familyName) {
    if (familyName == last_name) {
      pure = 1;
    }
  });

  if (pure == 1) {
    return "Pureblood";
  } else {
    return "Mudblood";
  }
}
////////////// BLOOD STATUS CHECK + SET: ////////////////////

////////////// CLEAN DATA: ////////////////////
function prepareObjects(jsonData, jsonBloodStatusData) {
  jsonData.forEach(jsonObject => {
    //clean data. Create from student prototype.
    const student = Object.create(StudentPrototype);

    let nameParts = getNameParts(jsonObject.fullname);
    if (nameParts.length == 3) {
      student.firstName = nameParts[0];
      student.middleName = nameParts[1];
      student.lastName = nameParts[2];
      student.name = nameParts[0] + " " + nameParts[1] + " " + nameParts[2];
    } else if (nameParts.length == 2) {
      student.firstName = nameParts[0];
      student.lastName = nameParts[1];
      student.name = nameParts[0] + " " + nameParts[1];
    } else if (nameParts.length == 1) {
      student.firstName = nameParts[0];
      student.lastName = "Last name unknown";
      student.name = nameParts[0];
    }

    student.house = capitalize(jsonObject.house);
    student.img = getImgSrc(student.name);
    student.id = uuidv4();
    student.prefect = false;
    student.blood_status = compareBloodstatus(student.lastName, jsonBloodStatusData);
    student.inqsquad = false;

    allStudents.push(student);
    currentStudents.push(student);
  });

  let hackerLee = {
    name: "Annalee Engsted",
    firstName: "Annalee",
    middleName: "Karoline",
    lastName: "Engsted",
    house: "Ravenclaw",
    img: "img/hackerlee.jpg",
    prefect: true,
    blood_status: "Mudblood",
    inqsquad: true,
    id: uuidv4()
  };
  allStudents.push(hackerLee);
  currentStudents.push(hackerLee);

  sortButton = "last_name";
  sortCurrentStudents(sortButton);
  showOtherData();
}

// function to generate UUIDs from https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getLastNameString(fullName) {
  return fullName.substring(fullName.lastIndexOf(" ") + 1, fullName.length);
}

function getNameParts(fullName) {
  fullName = fullName.trim();

  let nameParts = fullName.split(" ");
  for (let i = 0; i < nameParts.length; i++) {
    nameParts[i] = capitalize(nameParts[i]);
  }

  return nameParts;
}

function capitalize(name) {
  name =
    name
      .trim()
      .charAt(0)
      .toUpperCase()
      .trim() +
    name
      .trim()
      .slice(1)
      .toLowerCase();
  return name;
}

function getImgSrc(fullName) {
  if (fullName == "Parvati Patil") {
    return "images/patil_parvati.png";
  } else if (fullName == "Padma Patil") {
    return "images/patil_padme.png";
  } else {
    let src = "images/" + fullName.substring(fullName.lastIndexOf(" ") + 1, fullName.length).toLowerCase() + "_" + fullName.substring(0, 1).toLowerCase() + ".png";
    return src;
  }
}

////////////// CLEAN DATA END ////////////////////

////////////// CLICK CONTROLLER: ////////////////////

function listClickController(event) {
  // controller for clicks in the student list- if data-attribute == this, redirect to appropriate function. Get what button was clicked, and what id it has (remember to add id to button in showStudentList) then match to student id.
  //TO DO: Lots of repetition here again, fix later.
  let element = event.target;
  const id = element.dataset.id;
  let indexAll = findByIdAll(id);
  let indexCur = findByIdCurrentStudents(id);
  // let clickedStudent = allStudents[indexAll];
  let clickedStudent = currentStudents[indexCur];

  // could also use (element.dataset.action === "remove")
  if (element.getAttribute("data-action") == "remove") {
    //TO DO: move this into its own expel function
    if (clickedStudent.name == "Annalee Engsted") {
      console.log("clickedStudent is read as Annalee");
      hackerman();
    } else {
      expelledStudents.push(clickedStudent);
      expelAnimation(element);
      allStudents.splice(indexAll, 1);
      currentStudents.splice(indexCur, 1);
      showOtherData();
    }
  } else if (element.getAttribute("data-action") == "add_prefect") {
    addingPrefectEvent(clickedStudent, element);
  } else if (element.getAttribute("data-action") == "remove_prefect") {
    removePrefect(clickedStudent, element);
  } else if (element.getAttribute("data-action") == "open_popup") {
    openPopUp(clickedStudent);
  } else if (element.getAttribute("data-action") == "add_squad") {
    addingInqSquadEvent(clickedStudent, element);
  } else if (element.getAttribute("data-action") == "remove_squad") {
    removeFromInqSquad(clickedStudent, element);
  }
}

function findByIdCurrentStudents(id) {
  return currentStudents.findIndex(obj => obj.id == id);
}

function findByIdAll(id) {
  return allStudents.findIndex(obj => obj.id == id);
}

////////////// CLICK CONTROLLER END ////////////////////

////////////// RANDOMIZE BLOOD STATUS ////////////////////
function randomize() {
  //loop through allstudents, if student.bloodstatus == "Mudblood", then student.bloodstatus == "Pureblood". Create random.Math function for purebloods.

  allStudents.forEach(student => {
    if (student.blood_status == "Mudblood") {
      student.blood_status = "Pureblood";
    } else if (student.blood_status == "Pureblood") {
      //randomize here, implement timer in inq. squad:
      //The only way I know how- generate a random number between 1 and 2, if 1 = Pureblood, if 2 = mudblood. Haven't had time to check if this works.
      let number = generateRandomNumber();
      if (number == 1) {
        student.blood_status = "Pureblood";
      } else {
        student.blood_status = "Mudblood";
      }
    }
  });
}

function generateRandomNumber() {
  return Math.floor(Math.random() * (2 - 1 + 1) + 1);
}
////////////// RANDOMIZE BLOOD STATUS END ////////////////////

////////////// HACKERMAN ////////////////////
function hackerman() {
  //if user tries to expel me, animations:
  document.querySelector(".animation_placeholder img").src = "img/hackerman.jpg";
  document.querySelector(".animation_placeholder img").classList.add("spin");
  document.querySelector(".animation_placeholder img").addEventListener("animationend", () => {
    document.querySelector(".animation_placeholder img").classList.remove("spin");
    document.querySelector(".animation_placeholder img").src = "";

    console.log("Error alert, has gone into hackerman()");
  });
  alert("Error: You do not have permission to expel this student.");
}

////////////// HACKERMAN END ////////////////////

////////////// INQUISITORIAL SQUAD EVENTS: ////////////////////

function addingInqSquadEvent(clickedStudent, element) {
  //check if student.house is slytherin or student.blood_status is pure, then add. Maybe add animation
  console.log("addToInqSquad");
  if (clickedStudent.house == "Slytherin" || clickedStudent.blood_status == "Pureblood") {
    addToInqSquad(clickedStudent, element);
    console.log("Gone into addingInqSquad");
  } else {
    alert("This student is either not a pureblood or a member of house Slytherin and cannot be made part of the Inquisitorial Squad.");
  }
}

function addToInqSquad(clickedStudent, element) {
  element.style.color = "red";
  clickedStudent.inqsquad = true;
  document.querySelector(".animation_placeholder_inq img").src = "img/umbridge.jpg";
  document.querySelector(".animation_placeholder_inq img").classList.add("supersize");
  document.querySelector(".animation_placeholder_inq img").addEventListener("animationend", () => {
    document.querySelector(".animation_placeholder_inq img").classList.remove("supersize");
    document.querySelector(".animation_placeholder_inq img").src = "";
  });

  //Set timeout event here => after time, student.inqsquad = false;. Element.style.color = "black"
  setTimeout(function() {
    element.style.color = "black";
    clickedStudent.inqsquad = false;
  }, 10000);
}

function removeFromInqSquad(clickedStudent, element) {
  element.nextElementSibling.style.color = "black";
  clickedStudent.inqsquad = false;
  document.querySelector(".animation_placeholder_inqrem img").src = "img/snape.jpg";
  document.querySelector(".animation_placeholder_inqrem img").classList.add("spin_scale");
  document.querySelector(".animation_placeholder_inqrem img").addEventListener("animationend", () => {
    document.querySelector(".animation_placeholder_inqrem img").classList.remove("spin_scale");
    document.querySelector(".animation_placeholder_inqrem img").src = "";
  });
}

////////////// INQUISITORIAL SQUAD EVENTS END ////////////////////

////////////// PREFECT EVENTS: ////////////////////

function addingPrefectEvent(clickedStudent, element) {
  //get house of student, check this against number of prefects in same house. If <2, add prefect, else show alert
  let house = clickedStudent.house;
  //console.log(house);
  console.log(clickedStudent);
  let prefectsInHouse = getPrefectsInHouse(house);
  console.log(prefectsInHouse);
  if (prefectsInHouse.length < 2) {
    addPrefect(clickedStudent, element);
  } else {
    showAlert(house, prefectsInHouse, element);
  }
}

function showAlert(house, prefectsInHouse, element) {
  //TO DO!!!! Loooots of repetition here, fix later when I have time.
  //Show alert popup, insert textcontent, add eventlisteners(click => set student.prefect = false from prefectsInHouse, remove prefect color code)
  document.querySelector("#alert").style.display = "block";
  document.querySelector("#alert .p_top").textContent = "There are currently already 2 prefects in " + house + ", please revoke prefect status for one of the following before adding new:";
  document.querySelector("#alert .stud_0").textContent = prefectsInHouse[0].name;
  document.querySelector("#alert .stud_0").addEventListener("click", function() {
    document.querySelector("#alert .stud_0").textContent = prefectsInHouse[0].name + " prefect status revoked!";
    prefectsInHouse[0].prefect = false;
    document.querySelectorAll(".prefect").forEach(prefectButton => {
      if (prefectButton.dataset.id == prefectsInHouse[0].id) {
        prefectButton.style.color = "black";
      }
    });
    setTimeout(function() {
      document.querySelector("#alert").style.display = "none";
    }, 3000);
  });

  document.querySelector("#alert .stud_1").textContent = prefectsInHouse[1].name;
  document.querySelector("#alert .stud_1").addEventListener("click", function() {
    document.querySelector("#alert .stud_1").textContent = prefectsInHouse[1].name + " prefect status revoked!";
    prefectsInHouse[1].prefect = false;
    document.querySelectorAll(".prefect").forEach(prefectButton => {
      if (prefectButton.dataset.id == prefectsInHouse[1].id) {
        prefectButton.style.color = "black";
      }
    });
    setTimeout(function() {
      document.querySelector("#alert").style.display = "none";
    }, 3000);
  });
}

function getPrefectsInHouse(house) {
  return allStudents.filter(student => {
    if (student.house === house) {
      if (student.prefect === true) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  });
}

function addPrefect(clickedStudent, element) {
  clickedStudent.prefect = true;
  // prefectsInHouse.push(clickedStudent);
  element.style.color = "red";
}

function removePrefect(clickedStudent, element) {
  clickedStudent.prefect = false;
  element.nextElementSibling.style.color = "black";
}

////////////// PREFECT EVENTS END ////////////////////

////////////// EXPEL EVENTS: ////////////////////

function expelAnimation(element) {
  document.querySelector(".animation_placeholder_expel img").src = "img/cat.jpg";
  element.parentElement.parentElement.classList.add("shake");
  document.querySelector(".animation_placeholder_expel img").classList.add("shake_slow");
  console.log("added shake");
  element.parentElement.parentElement.addEventListener("animationend", () => {
    element.parentElement.parentElement.remove();
    resetExpelAnimation(element);
  });
}

function resetExpelAnimation(element) {
  element.parentElement.parentElement.classList.remove("shake");
  document.querySelector(".animation_placeholder_expel img").classList.remove("shake_slow");
  document.querySelector(".animation_placeholder_expel img").src = "";
}

////////////// EXPEL EVENTS END ////////////////////

////////////// STUDENT POP-UP EVENTS: ////////////////////

function openPopUp(student) {
  let prefectStr = "";
  if (student.prefect == true) {
    prefectStr = "Prefect";
  } else {
    prefectStr = "None";
  }

  // TO DO: make a template out of this
  document.querySelector("#pop_content").innerHTML = `
  <section class="pop_info"> 
<h2>First Name: ${student.firstName}</h2>
<h2>Middle Name: ${student.middleName}</h2>
<h2>Last Name: ${student.lastName}</h2>
<p>Prefect status: ${prefectStr}</p>
<p>Blood status: ${student.blood_status}</p>
</section> 
<section>
<h3>House</h3>
<h3>${student.house}</h3>
</section> 
<img src = ${student.img} alt = "${student.name}">
<img src = "img/${student.house}.png" alt = "${student.house} Crest">

`;

  document.querySelector("#popup").style.display = "block";
  let studentHouse = `${student.house}`;
  stylePopup(studentHouse);
}

function stylePopup(studentHouse) {
  let theme = studentHouse;
  document.querySelector("html").setAttribute("data-theme", theme);

  document.querySelector(".exit button").addEventListener("click", () => {
    document.querySelector("#popup").style.display = "none";
  });
}

////////////// STUDENT POP-UP EVENTS END ////////////////////

////////////// FILTER & SORT EVENTS ////////////////////

function setFilter() {
  house = this.getAttribute("data-house");

  filterCurrentStudents(house);
}
function filterCurrentStudents(house) {
  //filter allstudents by house
  let students = allStudents.filter(filterByHouse);
  function filterByHouse(student) {
    if (student.house === house) {
      return true;
    } else if (house === "all") {
      return true;
    } else {
      return false;
    }
  }

  currentStudents = students;

  document.querySelector("#house_stats").textContent = `${house}: ${students.length} students`;
  showStudentList();
}

function setSort() {
  sortButton = this.getAttribute("data-sort");
  sortCurrentStudents(sortButton);
}

function sortCurrentStudents(sortButton) {
  // Sort the current list, based on variable SortButton, return new list
  currentStudents.sort((a, b) => {
    let comp;
    if (sortButton === "first_name") {
      comp = a.name.localeCompare(b.name);
    } else if (sortButton === "last_name") {
      comp = a.lastName.localeCompare(b.lastName);
    } else if (sortButton === "house_sort") {
      comp = a.house.localeCompare(b.house);
    }
    return comp;
  });

  showStudentList();
}

////////////// FILTER & SORT EVENTS END ////////////////////

////////////// SHOW STUDENT LIST ////////////////////

function showStudentList() {
  const dest = document.querySelector("#list");
  const tempStudent = document.querySelector("template#student");

  // clear the list
  document.querySelector("#list").innerHTML = "";

  currentStudents.forEach(student => {
    let clone = tempStudent.cloneNode(true).content;

    if (student.prefect == true && student.inqsquad == true) {
      clone.querySelector(".status").innerHTML = "Prefect and Inquisitorial Squad";
    } else if (student.prefect == true) {
      clone.querySelector(".status").innerHTML = "Prefect";
    } else if (student.inqsquad == true) {
      clone.querySelector(".status").innerHTML = "Inquisitorial Squad";
    }

    clone.querySelector(".name").innerHTML = student.name;
    clone.querySelector(".house").innerHTML = student.house;
    //Add ID to ALL student buttons, TO DO::: repetition here- fix later (somehow- forEach data-action add dataset?):
    clone.querySelector("[data-action=remove]").dataset.id = student.id;
    clone.querySelector("[data-action=open_popup]").dataset.id = student.id;
    clone.querySelector("[data-action=add_prefect]").dataset.id = student.id;
    clone.querySelector("[data-action=remove_prefect]").dataset.id = student.id;
    clone.querySelector("[data-action=add_squad]").dataset.id = student.id;
    clone.querySelector("[data-action=remove_squad]").dataset.id = student.id;
    dest.appendChild(clone);
  }); //forEach loop end
}

function showOtherData() {
  document.querySelector(".totalstudents").textContent = allStudents.length;
  document.querySelector(".expelled").textContent = expelledStudents.length;
}

//PROTOTYPE:

const StudentPrototype = {
  name: "-name-",
  firstName: "-name-",
  middleName: "-none-",
  lastName: "-none-",
  house: "-house-",
  img: "-img-",
  prefect: "-prefect-",
  blood_status: "-blood-",
  expelled: "-expelled-",
  inqsquad: "-inqsquad-"
};
