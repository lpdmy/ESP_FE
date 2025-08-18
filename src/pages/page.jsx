import { useState, useEffect } from "react";
import Header from "../components/LandingPage/Header";
import Footer from "../components/LandingPage/Footer";
import Sidebar from "../components/LandingPage/Sidebar";
import NewsFeed from "../components/LandingPage/NewsFeed";
import RightPanel from "../components/LandingPage/RightPanel";
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
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-2 sticky top-6 self-start">
            <Sidebar activeTab="home" onTabChange={() => {}} />
          </aside>

          {/* Center Feed */}
          <section className="col-span-12 lg:col-span-6 xl:col-span-7 space-y-6">
            <NewsFeed />
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-card rounded-lg p-6 animate-pulse">
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
              : posts.map((post) => (
                  <PostCard
                    key={post.id}
                    author={post.user?.name}
                    class={post.user?.class}
                    time={post.time || ""}
                    content={post.content}
                    image={post.image}
                    likes={post.likes ?? 0}
                    comments={Array.isArray(post.comments) ? post.comments.length : 0}
                    shares={post.shares ?? 0}
                    isVerified={Boolean(post.isVerified)}
                    contestEntry={Boolean(post.contestEntry)}
                  />
                ))}
          </section>

          {/* Right Panel */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-3 sticky top-6 self-start">
            <RightPanel />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Page;
