//Get all components of 'form'
const dayRoot = document.getElementsByClassName("item")[0].children;
const monthRoot = document.getElementsByClassName("item")[1].children;
const yearRoot = document.getElementsByClassName("item")[2].children;
const masterError = document.getElementById("masterError");

//Merges all components into one object
const formSchema = {
  day: {
    label: dayRoot[0],
    input: dayRoot[1],
    error: dayRoot[2],
  },
  month: {
    label: monthRoot[0],
    input: monthRoot[1],
    error: monthRoot[2],
  },
  year: {
    label: yearRoot[0],
    input: yearRoot[1],
    error: yearRoot[2],
  },
};

const monthMaxDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

//Function for toggle error visibility
function setError(name, err, stat, master = false) {
  if (stat) {
    formSchema[name].input.classList.add("error");
    formSchema[name].label.classList.add("error");
    if (master) {
      masterError.textContent = err;
    } else {
      formSchema[name].error.textContent = err;
    }
  } else {
    formSchema[name].input.classList.remove("error");
    formSchema[name].label.classList.remove("error");
    formSchema[name].error.textContent = "";
    masterError.textContent = "";
  }
}

//Function for check all errors
function checkErrors() {
  const errors = {};
  let success = true;

  //Validate inputs
  for (const form in formSchema) {
    if (formSchema[form].input.value.length === 0) {
      errors[form] = "This field is required";
    } else if (form === "day") {
      if (+formSchema.day.input.value < 1 || +formSchema.day.input.value > 31) {
        errors.day = "Must be a valid day";
      }
    } else if (form === "month") {
      if (+formSchema.month.input.value < 1 || +formSchema.month.input.value > 12) {
        errors.month = "Must be a valid month";
      }
    } else if (form === "year" && +formSchema.year.input.value < 0) {
      errors.year = "Must be a valid year";
    }
    if (errors[form]) {
      setError(form, errors[form], true);
      success = false;
    } else setError(form, null, false);
  }

  //Validate date
  if (success) {
    const dateAge = moment([formSchema.year.input.value, formSchema.month.input.value, formSchema.day.input.value], "YYYY-MM-DD");
    if (moment().diff(dateAge, "days") <= 0) {
      success = false;
      errors.master = "Must be in the past";
    } else if (formSchema.day.input.value > monthMaxDays[formSchema.month.input.value - 1]) {
      if (moment([formSchema.year.input.value]).isLeapYear() && +formSchema.month.input.value === 2) {
        if (formSchema.day.input.value > 29) {
          success = false;
          errors.master = "Must be a valid date";
        }
      } else {
        success = false;
        errors.master = "Must be a valid date";
      }
    }
    if (errors.master) {
      for (const form in formSchema) {
        setError(form, errors.master, true, true);
      }
    }
  }

  return success;
}

//Variables responsible for animations
let interval;
let dayLerp = 0;
let monthLerp = 0;
let yearLerp = 0;

//Submit function
document.getElementById("submit").addEventListener("click", (e) => {
  e.preventDefault();
  if (checkErrors()) {
    //Gets the current time and birth
    const birthDate = moment([formSchema.day.input.value, formSchema.month.input.value, formSchema.year.input.value], "DD-MM-YYYY");
    const actualDate = moment();

    //Gets the time already passed
    const yearPassed = actualDate.diff(birthDate, "years");
    const monthPassed = actualDate.diff(birthDate, "months") % 12;
    const dayPassed = Math.floor((actualDate.diff(birthDate, "months", true) - actualDate.diff(birthDate, "months")) * 30.44);

    //Responsible for animations
    function draw() {
      dayLerp = lerp(dayLerp, dayPassed, 0.02);
      monthLerp = lerp(monthLerp, monthPassed, 0.02);
      yearLerp = lerp(yearLerp, yearPassed, 0.02);

      document.getElementById("days").textContent = dayLerp.toFixed();
      document.getElementById("months").textContent = monthLerp.toFixed();
      document.getElementById("years").textContent = yearLerp.toFixed();
      if (+yearLerp.toFixed() === yearPassed && +monthLerp.toFixed() === monthPassed && +dayLerp.toFixed() === dayPassed) {
        clearInterval(interval);
      }
    }

    //Verifys animations and resets interval
    if (interval) {
      clearInterval(interval);
      dayLerp = 0;
      monthLerp = 0;
      yearLerp = 0;
    }

    //Runs animations
    interval = setInterval(draw, 1000 / 60);
  }
});

//Corrected 'maxlength' of the input number
for (const input of document.querySelectorAll("input[type=number]")) {
  if (e.target.maxLength) input.addEventListener("input", (e) => (e.target.value = e.target.value.slice(0, e.target.maxLength)));
}
