const socket = io();
let friends;

async function getInfoChat() {
  let response = await fetch("/getInfoAboutUser", {
    method: "GET",
  });
  response = await response.json();
  return response;
}

function messageDiv(user) {
  let date = moment.utc(user.date).local().format("MMMM Do YYYY, h:mm:ss a");

  return `<div class="message">
  <p>
    <span class="message__name">${user.senders_name}</span>
    <span class="message__meta">${date}</span>
  </p>
  <p>${user.message}</p>
</div>`;
}
function insert_input(user) {
  let messageForm = document.getElementById("message-form");
  messageForm.innerHTML = "";
  messageForm.innerHTML = `<input id="${user}" name="message" placeholder="Message" onkeydown = "if (event.keyCode == 13)
  document.getElementById('sendButton').click()" /><button id="sendButton" onclick="sendMessage()" >Send</button>`;
}
async function sendMessage() {
  let id = document.getElementById("message-form").firstChild.id;
  let input = { user: id, text: document.getElementById(id).value };

  let response = await fetch("/sendMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  response = await response.json();
  if (response == true) {
  } else return alert(response.error);
  let data1 = await fetch("/getInfoAboutUser?get=yes", {
    method: "GET",
  });
  data1 = await data1.json();
  let message = {
    username: data1.name,
    text: document.getElementById(id).value,
    room: sortIt(data1.username, id),
  };
  await socket.emit("sendMessage", message, (error) => {
    if (error) {
      return console.log(error);
    }
    document.getElementById(id).value = "";
    console.log("Message delivered!");
  });
}
socket.on("message", (message) => {
  let send = {
    senders_name: message.username,
    message: message.text,
    date: message.createdAt,
  };
  let insert = document.getElementById("insertMessages");
  insert.insertAdjacentHTML("beforeend", messageDiv(send));
});

async function messages(user) {
  insert_input(user);
  let response = await fetch(`/getMessages?user=${user}`, {
    method: "GET",
  });
  response = await response.json();

  let insert = document.getElementById("insertMessages");
  insert.innerHTML = "";
  insert.innerHTML = `<div id="messages" class="chat__messages"></div>`;

  if (response != []) {
    for (let i of response) {
      insert.insertAdjacentHTML("beforeend", messageDiv(i));
    }
  }

  let data1 = await fetch("/getInfoAboutUser?get=yes", {
    method: "GET",
  });
  data1 = await data1.json();
  if (!data1.friends.includes(user)) {
    alert("This user is not your friend");
  }
  let username = user;
  let room = sortIt(user, data1.username);
  socket.emit("join", { username, room }, (error) => {
    if (error) {
      alert(error);
      location.href = "/";
    }
  });
  const scrollingElement = document.getElementById("insertMessages");
  scrollingElement.scrollTop = scrollingElement.scrollHeight;
}

function friendsList(user) {
  return `<div class="friendsSide" onclick="messages('${user.username}')"style="padding-top: 10px;">
    <img
      src="./images/${user.profilePicture}"
      width="40"
      height="40"
      style="border-radius: 50%"
    />
    <p class="pp">${user.name}</p>
  </div>`;
}
(async function () {
  let response = await fetch("/getInfoChat", {
    method: "GET",
  });
  response = await response.json();
  friends = response.friends;
  delete response.friends;

  for (const [key, value] of Object.entries(response)) {
    localStorage.setItem(key, value);
  }
  let insert = document.getElementById("insertFriends");
  for (let i of friends) {
    insert.insertAdjacentHTML("afterbegin", friendsList(i));
  }
  document
    .getElementById("profileId")
    .setAttribute("href", `http://localhost:3000/profile/${response.username}`);
  document.getElementById("host").setAttribute("href", location.origin);
})();
async function goTo(link) {
  location.replace(link);
}

function searchInput() {
  return ` <div  class="searchInput" style="width: 100%">
      <input
        id="searchInput"
        style="width: 100%"
        class="comments"
        type="text"
        onkeyup="getSearchResult()"
        placeholder="Search StoryBook..."
      />
  </div><br><div id="insertResult"></div>
  `;
}

async function redirectProfile(username) {
  window.open(window.location.origin + "/profile/" + username);
}

let searchInputt = document.getElementById("searchInput");
let pageNumber = 2;
window.addEventListener("scroll", () => {
  if (
    window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight &&
    pageNumber < 100
  ) {
    // getPosts(pageNumber++);
  }
});
async function search() {
  modal.style.display = "block";
  document.getElementById("modalP").value = "Search...";
  document.body.classList.add("stop-scrolling");
  let search = document.getElementById("info");
  search.classList.add("classCollumn");
  search.classList.remove("classRow");

  search.innerHTML = "";
  search.innerHTML = searchInput();
  // search.classList.remove("classRow");
}
async function returnLikes(i) {
  return `<div class="likes" onclick="redirectProfile('${i.username}')"><img src= "./images/${i.profilePicture}" width="40" height="40"style="border-radius: 50%;"><p class="pp">${i.name}</p></div>`;
}

async function getSearchResult() {
  let input = document.getElementById("searchInput").value;
  let insert = document.getElementById("insertResult");
  insert.innerHTML = "";
  let response = "";
  if (input.length >= 3) {
    response = await fetch("/getSearchResult", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    });
    response = await response.json();
  }
  if (response != [] && response != "") {
    for (let i of response) {
      console.log(
        insert.insertAdjacentHTML("afterbegin", await returnLikes(i))
      );
    }
  }
}

const el = document.getElementById("columnd");
if (el) {
  el.scrollTop = el.scrollHeight;
}

function sortIt(a, b) {
  let result = "";
  let max = a.length >= b.length ? a.length : b.length;
  for (let i = 0; i < max; i++) {
    if (a[i] == undefined) {
      result = b + a;
      break;
    }
    if (b[i] == undefined) {
      result = a + b;
      break;
    }
    if (a[i] == b[i]) continue;
    if (a.charCodeAt(i) > b.charCodeAt(i)) {
      result = b + a;
      break;
    }
    if (b.charCodeAt(i) > a.charCodeAt(i)) {
      result = a + b;
      break;
    }
  }
  return result;
}
