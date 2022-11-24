let publicAreaElement = document.getElementById("publicArea");
let friendsAreaElement = document.getElementById("friendsArea");
let postPic = document.getElementById("postPic");
let leftSideName = document.getElementById("name");
let postName = document.getElementById("postName");
let deletePosts = document.getElementById("deletePosts");
let modalP = document.getElementById("modalP");
let leftPic = document.getElementById("name");

let pageNumber = 1;
let pageNumberFriends = 1;

(async function () {
  let response = await fetch("/getInfoAboutUser?get=yes", {
    method: "GET",
  });
  response = await response.json();

  for (const [key, value] of Object.entries(response)) {
    localStorage.setItem(key, value);
  }
  let name = response.name;
  postPic.src = `./images/${response.profilePicture}`;
  leftSideName.innerHTML = name;
  leftPic.src = `./images/${response.profilePicture}`;
  document.getElementById("pic1").src = `./images/${response.profilePicture}`;
  document.getElementById("pic").src = `./images/${response.profilePicture}`;
  document
    .getElementById("profileId")
    .setAttribute("href", `http://localhost:3000/profile/${response.username}`);
  postName.placeholder = `What's on your mind, ${name}`;
  getPosts(pageNumber);
  let friends = await fetch("/getFriendsList", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  friends = await friends.json();
  friendsRightPanel(friends);
  document.getElementById("host").setAttribute("href", location.origin);
})();
async function goTo(link) {
  location.replace(link);
}
async function friendsRightPanel(friends) {
  let element = document.getElementById("friendsRightPanel");
  for (let i of friends) {
    let data = `<div class="friend" >
    <div class="dp" onClick="parent.location='chat'">
       <img src="./images/${i.profilePicture}" alt="" />
    </div>
    <p class="name">${i.name}</p>
 </div>`;
    element.insertAdjacentHTML("beforeend", data);
  }
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
              src="./images/${profilePicture}"
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
async function publicArea() {
  publicAreaElement.classList.add("active");
  friendsAreaElement.classList.remove("active");
  let element = deletePosts;
  element.innerHTML = "";
  element.innerHTML = `<div id="posts"></div>`;
  pageNumber = 1;
  getPosts();
}
async function friendsArea() {
  publicAreaElement.classList.remove("active");
  friendsAreaElement.classList.add("active");
  let element = deletePosts;
  document.getElementById("deleteMyPosts").innerHTML = "";
  element.innerHTML = "";
  element.innerHTML = `<div id="posts"></div>`;
  pageNumberFriends = 1;
  getPosts();
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
  if (response.comment) {
    right.insertAdjacentHTML("beforeend", returnComment(response));
  }
}

async function returnLikes(i) {
  return `<div class="likes" onclick="redirectProfile('${i.username}')"><img src= "./images/${i.profilePicture}" width="40" height="40"style="border-radius: 50%;"><p class="pp">${i.name}</p></div>`;
}
function returnComment(i) {
  let a = `<div  class="likes"><img src= "./images/${i.profilePicture}" onclick="redirectProfile('${i.username}')" width="40" height="40"style="border-radius: 50%;"><p class="ppComment">${i.comment}</p></div>`;
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
async function showLikesAndComments(id) {
  modal.style.display = "block";
  document.body.classList.add("stop-scrolling");
  let info = document.getElementById("info");
  info.classList.remove("classCollumn");
  info.classList.add("classRow");
  info.innerHTML = "";
  info.innerHTML = `<div id="left"> <div class ="moveDown"> <p>No likes</p> </div> </div> <div id="right"> <div id="clr" class="likes1"> </div> </div>`;
  modalP.textContent = "Likes";
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

async function redirectProfile(username) {
  window.open(window.location.origin + "/profile/" + username);
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

async function getPosts(number) {
  if (number == undefined) number = 1;
  let publicArea = publicAreaElement;
  let body;
  if (publicArea.classList.contains("active")) {
    body = { number: pageNumber, isGlobal: true };
  } else {
    body = { number: pageNumberFriends++, isGlobal: false };
  }
  let response = await fetch("/getPosts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  response = await response.json();
  printPost(response);
}

window.addEventListener("scroll", () => {
  if (
    window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight &&
    pageNumber < 100
  ) {
    getPosts(pageNumber++);
  }
});
async function search() {
  modal.style.display = "block";
  modalP.value = "Search...";
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
      insert.insertAdjacentHTML("afterbegin", await returnLikes(i));
    }
  }
}

async function post() {
  let text = postName.value;
  let global = publicAreaElement.classList.contains("active") ? true : false;
  if (text.length < 3) return false;

  let response = await fetch("/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, isGlobal: global }),
  });
  response = await response.json();
  response.text = text;
  if (response.name) {
    response.date = "a few moments ago";
    await printPost(response, true);
    postName.value = "";
  }
}

async function logoff() {
  document.cookie = "token= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
  location.reload();
}
