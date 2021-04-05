import { blog } from "../http-common";

class BlogDataService {
  getAll() {
    return blog.get("index.php/wp-json/wp/v2/posts");
  }
}

export default new BlogDataService();