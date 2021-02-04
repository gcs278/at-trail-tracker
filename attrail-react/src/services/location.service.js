import http from "../http-common";

class LocationDataService {
  getAll() {
    return http.get("/");
  }

  getMyTrack() {
    return http.get("/mytrack");
  }

  get(id) {
    return http.get(`/tutorials/${id}`);
  }

  getLatest() {
    return http.get(`/latest`);
  }

  create(data) {
    return http.post("/tutorials", data);
  }

  update(id, data) {
    return http.put(`/tutorials/${id}`, data);
  }

  delete(id) {
    return http.delete(`/tutorials/${id}`);
  }

  deleteAll() {
    return http.delete(`/tutorials`);
  }

  findByTitle(title) {
    return http.get(`/tutorials?title=${title}`);
  }

  stats() {
    return http.get(`/stats`)
  }
}

export default new LocationDataService();