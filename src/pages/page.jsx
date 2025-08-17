import { useState, useEffect } from "react";
import Header from "../components/LandingPage/Header";
import Footer from "../components/LandingPage/Footer";
import StudentProfile from "../components/LandingPage/StudentProfile";
import PostCard from "../components/LandingPage/PostCard";
import { getPosts } from "../service/postsService";

const Page = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* If you have a Navbar, import and add it here */}
      {/* <Navbar /> */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <StudentProfile />
        <div className="space-y-6">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-card rounded-lg p-6 animate-pulse"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-muted rounded w-full mb-4"></div>
                  <div className="h-64 bg-muted rounded"></div>
                </div>
              ))
            : posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Page;
