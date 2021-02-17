import {auth} from "../http-common";

class AuthDataService {
  register(data) {
    return auth.post("/register", data);
  }
  login(data) {
    return auth.post("/login", data);
  }
}

export default new AuthDataService();