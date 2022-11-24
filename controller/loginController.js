const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");

async function login() {
  let data = {
    email: document.getElementById("emailLogin").value,
    password: document.getElementById("passwordLogin").value,
  };
  let response = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  response = await response.json();

  if (response.errors) {
    alert(Object.values(response.errors));
  } else {
    localStorage.clear();
    for (const [key, value] of Object.entries(response)) {
      localStorage.setItem(key, value);
    }
    document.location.reload();
  }
}
function capitalizeFirstLetter(string) {
  let s = string.toLowerCase();
  return s[0].toUpperCase() + s.slice(1);
}

async function register() {
  let name = document.getElementById("firstName").value.trim();
  let last = document.getElementById("lastName").value.trim();
  let data = {
    name: capitalizeFirstLetter(name) + " " + capitalizeFirstLetter(last),
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    friends: [],
  };
  let response = await fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  response = await response.json();
  if (response.errors) {
    for (const [key, value] of Object.entries(response.errors)) {
      alert(value);
    }
    delete response.errors;
  } else {
    localStorage.clear();
    for (const [key, value] of Object.entries(response)) {
      localStorage.setItem(key, value);
    }
    document.location.reload();
  }
}

signUpButton.addEventListener("click", () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
});
