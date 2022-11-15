// save reference to important DOM elements
var dateDisplayEl = $(`#currentDay`);
var containerEl = $(`.container-lg`);

// Wrap all code that interacts with the DOM in a call to jQuery
$(function () {

  function displayCalendar() {
    // clear calendar on the page
    containerEl.empty();
    // limit hour-x to standard business hours
    for (var x = 9;  x < 18; x++) {
      var rowEl = $(`<div>`).addClass(`row time-block`);
      // add hour-x as an id attribute
      rowEl.attr(`id`, `hour-${x}`);
      var hourEL = $('<div>').addClass(`col-2 col-md-1 hour text-center py-3`);
      if (x > 12 && x % 12) {
        hourEL.text(`${x % 12}PM`);
      } else if (x === 12) {
        hourEL.text(`${x}PM`);
      } else {
        hourEL.text(`${x % 12}AM`);
      }
      // add description text area to each time-block
      var descriptionEl = $(`<textarea>`).addClass(`col-8 col-md-10 description`);
      descriptionEl.attr(`rows`, `3`);
      // add save button to each time-block
      var saveEl = $(`<button>`).addClass(`btn saveBtn col-2 col-md-1`);
      saveEl.append(`<i class="fas fa-save" aria-hidden="true"></i>`);
  
      rowEl.append(hourEL, descriptionEl, saveEl);
      containerEl.append(rowEl);  
    }

    displayTimeBlocks();
    // apply the past, present, or future class to each time-block
    updateTimeBlocks();
  }

  // Save user input from time-block to localStorage
  function handleSave(event) {
    event.preventDefault();
    // get user input
    var descriptionInputEl =  $(this).siblings(`.description`).val().trim();
    // get stored time-blocks from localStorage
    var timeBlocks = readTimeBlocksFromStorage();
    // use id in the containing time-block as a key to save user input
    var key = $(this).parent().attr(`id`);

    // remove stored time-block from array if it shares the same key as user input
    for (var i = 0; i < timeBlocks.length; i++) {
      if (Object.keys(timeBlocks[i])[0] === key) {
        timeBlocks.splice(i, 1);
      }
    }

    var newTimeBlock = {
      [key]: descriptionInputEl
    };

    // add time-block to localStorage
    timeBlocks.push(newTimeBlock);
    saveTimeBlocksToStorage(timeBlocks);
  }

  // Take an array of time-blocks and save them in localStorage.
  function saveTimeBlocksToStorage(timeBlocks) {
    localStorage.clear();
    localStorage.setItem(`timeblocks`, JSON.stringify(timeBlocks));
  }

  // Update class to each time-block by comparing to the current hour
  function updateTimeBlocks() {
    var timeBlocksEl = $(`.time-block`);
    
    // get current hour
    var currentHour = dayjs().hour();

    for (var i = 0; i < timeBlocksEl.length; i++) {
      // get the number of hour for each time-block
      var timeBlockHour = timeBlocksEl.eq(i).attr(`id`);
      var hour = parseInt(timeBlockHour.substring(timeBlockHour.indexOf(`-`) + 1));
      
      // remove all classes
      timeBlocksEl.eq(i).removeClass();
      // apply the past, present, or future class to each time-block
      if (hour < currentHour) {
        timeBlocksEl.eq(i).addClass(`row time-block past`);
      } else if (hour > currentHour) {
        timeBlocksEl.eq(i).addClass(`row time-block future`);
      } else {
        timeBlocksEl.eq(i).addClass(`row time-block present`);
      }
    }
  }
  
  // Read time-blocks from localStorage and return array of time-block objects
  function readTimeBlocksFromStorage() {
    var timeBlocks = localStorage.getItem('timeblocks');
    // return an empty array ([]) if there aren't any time-blocks.
    if (timeBlocks) {
     timeBlocks = JSON.parse(timeBlocks);
    } else {
     timeBlocks = [];
   }
   return timeBlocks;
  }

  // Get saved user input and set the description for each time-block 
  function displayTimeBlocks() {
    // get time-blocks from localStorage
    var timeBlocks = readTimeBlocksFromStorage();

    // loop through saved user input
    for (var i = 0; i < timeBlocks.length; i++) {
      var timeBlock = timeBlocks[i];
      var key = Object.keys(timeBlock)[0];
      // set the description if the key matches the id attribute
      for (var j = 0; j < $(`.time-block`).length; j++) {
        if (key === $(`.time-block`).eq(j).attr(`id`)) {
          $(`.time-block`).eq(j).children(`.description`).text(timeBlock[key]);
        }
      }
    }
  }

  // Handle displaying the date
  function displayDate() {
    // get current date
    var date = String(dayjs().date());

    // add different ordinal suffixes to the numeric numbers
    var ordinals = ``;
    if (date > 3 && date < 21) {
      ordinals = `th`;
    } else {
      switch (date % 10) {
        case 1:
          ordinals = `st`;
          break;
        case 2:
          ordinals = `nd`;
          break;
        case 3:
          ordinals = `rd`;
          break;
        default:
          ordinals = `th`;
      }
    }
    var today = dayjs().format(`dddd, MMMM D`) + ordinals;
    dateDisplayEl.text(today);

    // clear localStorage once it is a new day
    if (dayjs().isSame(dayjs().startOf('day'), `second`)) {
      localStorage.clear();
    }

    // update time-blocks dynamically every hour without refreshing the page
    if (dayjs().isSame(dayjs().startOf('hour'), `second`)) {
      updateTimeBlocks();
    }
  }
  
  // Display the calendar for work day scheduler
  displayCalendar();
  displayDate();
  setInterval(displayDate, 1000);
  $(`.saveBtn`).on(`click`, handleSave);
});