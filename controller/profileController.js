let profilePost = 0;
async function getInfo() {
  let response = await fetch("/getInfoAboutUser?get=yes", {
    method: "GET",
  });
  response = await response.json();
  return response;
}
let profilePicture = "";
async function getProfileInfo() {
  let profileName = window.location.pathname;
  profileName = profileName.replace("/profile/", "");

  let response = await fetch("/getInfoAboutProfile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ profileName, controller: true }),
  });
  response = await response.json();
  if (!response) {
    location.replace(window.location.origin);
  }
  if (response.profilePicture == "") profilePicture = "default.jpg";
  else profilePicture = response.profilePicture;

  document.getElementById("profilePicture").src =
    window.location.origin + "/images/" + response.profilePicture;
  document.getElementById("profileName").innerHTML = response.name;
  return response;
}
(async function () {
  let response = await getInfo();
  document
    .getElementById("profileId")
    .setAttribute("href", `http://localhost:3000/profile/${response.username}`);
  await getProfileInfo();
  let profileName = window.location.pathname;
  profileName = profileName.replace("/profile/", "");

  for (const [key, value] of Object.entries(response)) {
    localStorage.setItem(key, value);
  }

  getProfilePosts();
  document.getElementById("host").setAttribute("href", location.origin);
})();

async function printPost2(object) {
  return `<div class="post"> <div class="post-top"> <div class="dp"> <img src="/images/${profilePicture}" alt=""> </div> <div class="post-info"> <p class="name">${object.name}</p> <span class="time">${object.date}</span> </div> <i class="fas fa-ellipsis-h"></i> </div> <div class="post-content"> ${object.text} </div> <div class="post-bottom"> <div class="action"> <i class="far fa-thumbs-up"></i> <span>Like</span> </div> <div class="action"> <i class="far fa-comment"></i> <span>Comment</span> </div> <div class="action"> <i class="fa fa-share"></i> <span>Share</span> </div> </div> </div>`;
}
async function accept(user) {
  let response = await fetch("/accept", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user }),
  });

  response = await response.json();
  if (response.response == "success") window.location.reload();
}
async function decline(user) {
  let response = await fetch("/decline", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user }),
  });

  response = await response.json();
  if (response.response == "success") window.location.reload();
}
async function removeFriend(user) {
  let response = await fetch("/removeFriend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user }),
  });

  response = await response.json();
  if (response.response == "success") window.location.reload();
}

async function addFriend(user) {
  let response = await fetch("/addFriend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user }),
  });

  response = await response.json();
  if (response.return == "success") window.location.reload();
}

async function removePending(user) {
  let response = await fetch("/removePending", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user }),
  });

  response = await response.json();

  if (response.return == "success") window.location.reload();
}
async function goTo(link) {
  location.replace(link);
}
async function redirectProfile(username) {
  window.open(window.location.origin + "/profile/" + username);
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
async function printPost(req, myPost) {
  let element = document.getElementById("posts");
  let elementMyPost = document.getElementById("my-post");
  let isMyPost = false;
  let profilePicture = "";
  if (myPost == true) {
    isMyPost = true;
    req = [req];
  }
  for (let object of req) {
    let classObject,
      spanObject = "";
    let flag = 0;

    if (isMyPost == false) {
      let datum = moment().format();
      let time = moment(object.date).format();
      let now = moment(datum).format();
      var startDate = moment(time, "YYYY-M-DD HH:mm:ss");
      var endDate = moment(now, "YYYY-M-DD HH:mm:ss");
      let result = endDate.diff(startDate, "minutes");

      if (0 <= result && result <= 5) object.date = "a few moments ago";
      if (6 <= result && result < 60) object.date = `${result} minutes ago`;
      if (60 < result && result <= 1440) {
        let time = Math.floor(result / 60);
        object.date = `${time} hours ago`;
      }
      if (1440 < result && result < 525600) {
        let time = Math.floor(result / 1440);
        object.date = `${time} days ago`;
      }
      if (result > 525600) {
        let time = Math.floor(result / 525600);
        object.date = `${time} years ago`;
      }

      for (let i of object.likes) {
        if (i._id == localStorage.getItem("_id")) {
          classObject = "fas fa-thumbs-up";
          spanObject = "color: navy";
          flag++;
        }
      }
      if (!flag) {
        classObject = "far fa-thumbs-up";
        spanObject = "color: black";
      }
      profilePicture = object.user.profilePicture;
    } else {
      classObject = "far fa-thumbs-up";
      spanObject = "color: black";
      profilePicture = object.profilePicture;
    }
    let host = String(window.location.href);
    if (host.includes("#")) host = host.slice(0, -1);
    let link = host + "profile/" + `${object.username}`;

    let likes = `<i id="${object._id}" class="${classObject}"></i> <span id="Span${object._id}"style="${spanObject}">`;
    let insertData = `<div class="post">
        <div class="post-top">
          <div class="dp">
            <img
              src="http://localhost:3000/images/${profilePicture}"
              alt=""
              onclick="window.open('${link}')"
            />
          </div>
          <div class="post-info">
            <p class="name" onclick="goTo('${link}')">${object.name}</p>
            <span class="time">${object.date}</span>
          </div>
          <i class="fas fa-ellipsis-h"></i>
        </div>
        <div class="post-content">${object.text}</div>
        <div class="post-bottom">
          <div class="action" onclick="like('${object._id}')">
            ${likes}Like</span>
          </div>

          <div class="action comments " onclick="showLikesAndComments('${object._id}')">
            <i class="far fa-comment"></i> <span>Show likes and comments</span>
          </div>
          <div class="action" onclick="postComment('${object._id}')"><i class="fa fa-share"></i> <span>Share</span></div>
        </div>
        
      </div>
      `;

    if (myPost != true) element.insertAdjacentHTML("beforebegin", insertData);
    else elementMyPost.insertAdjacentHTML("afterbegin", insertData);
  }
}
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
async function getProfilePosts(number) {
  let profileName = window.location.pathname;
  let infoP1 = document.getElementById("infoP1");
  let infoP2 = document.getElementById("infoP2");
  let infoDiv1 = document.getElementById("infoDiv1");
  let infoDiv2 = document.getElementById("infoDiv2");
  profileName = profileName.replace("/profile/", "");
  if (number == undefined) number = 1;
  let data = {
    number,
    profileName,
  };
  let response = await fetch(`/getProfilePosts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  response = await response.json();
  if (response[0] == "me") {
    response.shift();
    printPost(response);
    return;
  }
  if (response.return == "request") {
    infoP1.innerText = "Accept";
    infoDiv1.setAttribute("onclick", `accept("${profileName}")`);
    infoP2.innerText = "Decline";
    infoDiv2.setAttribute("onclick", `decline("${profileName}")`);
    return;
  }
  if (response.return == "pending") {
    infoP1.innerText = "Remove pending";
    infoDiv1.setAttribute("onclick", `removePending("${profileName}")`);
    return;
  }
  if (response.return == false) {
    infoP1.innerText = "Add Friend";
    infoDiv1.setAttribute("onclick", `addFriend("${profileName}")`);
    return;
  }

  infoP1.innerText = "Remove Friend";
  infoDiv1.setAttribute("onclick", `removeFriend("${profileName}")`);
  infoP2.innerText = "Message";
  infoDiv2.setAttribute("onclick", `openChat()`);

  let element = document.getElementById("posts");
  printPost(response);
}
async function openChat() {
  window.open("http://localhost:3000/chat");
}
async function like(id) {
  let response = await fetch("/like", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  response = await response.json();

  let flag = 0;
  for (let i of response.likes) {
    if (i._id == localStorage.getItem("_id")) {
      document.getElementById(id).classList.remove("far");
      document.getElementById(id).classList.add("fas");
      document.getElementById(`Span${id}`).style.color = "navy";
      flag++;
    }
  }
  if (!flag) {
    document.getElementById(id).classList.remove("fas");
    document.getElementById(id).classList.add("far");
    document.getElementById(`Span${id}`).style.color = "black";
  }
}
async function postComment(id) {
  let name = `inputComment${id}`;
  let text = document.getElementById(name).value;
  let insert = { text, id };
  let response = await fetch("/postComment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(insert),
  });
  response = await response.json();
  document.getElementById(name).value = "";
  var noComment = document.querySelector(".moveDown");
  if (noComment) {
    noComment.innerHTML = "";
  }
  // document.querySelector(".moveDown").innerHTML = "";
  if (response.comment) {
    right.insertAdjacentHTML("beforeend", returnComment(response));
  }
}
async function showLikesAndComments(id) {
  modal.style.display = "block";
  document.body.classList.add("stop-scrolling");
  let info = document.getElementById("info");
  info.classList.remove("classCollumn");
  info.classList.add("classRow");
  info.innerHTML = "";
  info.innerHTML = `<div id="left"> <div class ="moveDown"> <p>No likes</p> </div> </div> <div id="right"> <div id="clr" class="likes1"> </div> </div>`;
  document.getElementById("modalP").textContent = "Likes";
  let response = await fetch("/showLikesAndComments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  response = await response.json();

  let left = document.getElementById("left");
  left.innerHTML = "";

  if (response.likes.length) {
    for (let i of response.likes) {
      left.insertAdjacentHTML("afterbegin", await returnLikes(i));
    }
  } else {
    left.insertAdjacentHTML(
      "afterbegin",
      "<div class='moveDown'><p>No likes</p></div>"
    );
  }
  let right = document.getElementById("right");
  var class_name = "rmv";
  right.innerHTML = "";

  right.insertAdjacentHTML("afterbegin", returnPostComment(id));

  if (response.comments.length) {
    for (let i of response.comments) {
      right.insertAdjacentHTML("beforeend", returnComment(i));
    }
  } else {
    right.insertAdjacentHTML(
      "beforeend",
      "<div class='moveDown'><p>No Comment</p></div>"
    );
  }
  // modal.style.display = "block";
}
async function returnLikes(i) {
  return `<div class="likes" onclick="redirectProfile('${i.username}')"><img src= "http://localhost:3000/images/${i.profilePicture}" width="40" height="40"style="border-radius: 50%;"><p class="pp">${i.name}</p></div>`;
}
function returnComment(i) {
  let a = `<div  class="likes"><img src= "http://localhost:3000/images/${i.profilePicture}" onclick="redirectProfile('${i.username}')" width="40" height="40"style="border-radius: 50%;"><p class="ppComment">${i.comment}</p></div>`;
  return a;
}
function returnPostComment(id) {
  return `<div class="dd"><img src= "http://localhost:3000/images/${localStorage.getItem(
    "profilePicture"
  )}" width="40" height="40"style="border-radius: 50%;">
  <div style="position: relative;width: 100%">
  <input id="inputComment${id}" style="width: 100%" class="comments" type="text" style="" placeholder="What's on your mind, ${localStorage.getItem(
    "name"
  )}" />
  <div id="aaaa" class="action"  style="position: absolute; right: 10px; transform: translateY(-50%);top: 50%;">
  <i class="fa fa-paper-plane pointer" onclick="postComment('${id}')"></i>
     </div>
  </div></div>`;
}
let pageNumber = 2;
window.addEventListener("scroll", () => {
  if (
    window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight &&
    pageNumber < 100
  ) {
    getProfilePosts(pageNumber++);
  }
});

async function post() {
  let text = document.getElementById("namePa").value;

  if (text.length < 3) return false;

  let response = await fetch("/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  response = await response.json();
  response.text = text;

  if (response.acknowledged) {
    let element = document.getElementById("my-post");
    response.date = "a few moments ago";
    element.insertAdjacentHTML("afterbegin", await printPost(response));
    document.getElementById("namePa").value = "";
  }
}
async function goToProfilePage() {
  console.log("goToProfilePage ~ goToProfilePage", goToProfilePage);
}

async function logoff() {
  document.cookie = "token=; Max-Age=0; path=/; domain=" + location.host;
  location.reload();
}
