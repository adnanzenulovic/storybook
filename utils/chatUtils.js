const users = [];

export default class ChatUtils {
  static addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room) {
      return {
        error: "Username and room are required!",
      };
    }

    const user = { id, username, room };
    users.push(user);
    return { user };
  };

  static removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
      return users.splice(index, 1)[0];
    }
  };

  static getUser = (id) => {
    return users.find((user) => user.id === id);
  };

  static getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room);
  };
  static generateMessage = (username, text) => {
    return {
      username,
      text,
      createdAt: new Date().getTime(),
    };
  };
}
