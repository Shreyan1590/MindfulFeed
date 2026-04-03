import { ImageWithFallback } from "./figma/ImageWithFallback";
import { BookOpen, Clock, TrendingUp, Smartphone, Map, Menu } from "lucide-react";
import { useNavigate } from "react-router";

interface MindfulPost {
  id: number;
  title: string;
  category: string;
  readTime: string;
  attentionScore: number;
  imageUrl: string;
  excerpt: string;
  author: string;
}

const posts: MindfulPost[] = [
  {
    id: 1,
    title: "The Art of Mindful Living in a Digital World",
    category: "Wellness",
    readTime: "8 min read",
    attentionScore: 0.92,
    imageUrl: "https://images.unsplash.com/photo-1599036629621-07f8cb665695?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMG5hdHVyZSUyMG1lZGl0YXRpb24lMjBjYWxtfGVufDF8fHx8MTc3NTE1MTYwOHww&ixlib=rb-4.1.0&q=80&w=1080",
    excerpt: "Discover how to create balance and presence in an increasingly connected world through practical mindfulness techniques.",
    author: "Sarah Chen"
  },
  {
    id: 2,
    title: "Deep Work: Finding Focus in the Age of Distraction",
    category: "Productivity",
    readTime: "12 min read",
    attentionScore: 0.88,
    imageUrl: "https://images.unsplash.com/photo-1760011627123-ca5c3421f70b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5kZnVsJTIwcmVhZGluZyUyMGJvb2slMjBjb2ZmZWV8ZW58MXx8fHwxNzc1MTUxNjA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    excerpt: "Learn strategies to cultivate deep focus and accomplish meaningful work without constant interruptions.",
    author: "Marcus Rodriguez"
  },
  {
    id: 3,
    title: "Sustainable Living: Small Changes, Big Impact",
    category: "Lifestyle",
    readTime: "6 min read",
    attentionScore: 0.85,
    imageUrl: "https://images.unsplash.com/photo-1604549053344-d353adf347d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGxpdmluZyUyMG1pbmltYWxpc3QlMjBsaWZlc3R5bGV8ZW58MXx8fHwxNzc1MTUxNjA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    excerpt: "Explore simple, actionable steps toward a more sustainable and intentional lifestyle that benefits both you and the planet.",
    author: "Emma Thompson"
  },
  {
    id: 4,
    title: "The Science of Wellness: Mind-Body Connection",
    category: "Health",
    readTime: "10 min read",
    attentionScore: 0.91,
    imageUrl: "https://images.unsplash.com/photo-1767611118479-3f3a8704c8ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwd2VsbG5lc3MlMjB5b2dhfGVufDF8fHx8MTc3NTE1MTYxMHww&ixlib=rb-4.1.0&q=80&w=1080",
    excerpt: "Understanding the profound connection between mental and physical health through evidence-based practices.",
    author: "Dr. Amelia Foster"
  },
  {
    id: 5,
    title: "Creative Spaces: Designing for Inspiration",
    category: "Design",
    readTime: "7 min read",
    attentionScore: 0.79,
    imageUrl: "https://images.unsplash.com/photo-1622579521534-8252f7da47fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMG1vZGVybiUyMGRlc2t8ZW58MXx8fHwxNzc1MTMxMzM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    excerpt: "How your physical environment shapes creativity and productivity, with practical tips for optimizing your workspace.",
    author: "James Park"
  },
  {
    id: 6,
    title: "Reflections on Slow Living and Intentionality",
    category: "Philosophy",
    readTime: "9 min read",
    attentionScore: 0.87,
    imageUrl: "https://images.unsplash.com/photo-1635357812542-1105b4d38c59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aG91Z2h0ZnVsJTIwcGVyc29uJTIwY29udGVtcGxhdGluZ3xlbnwxfHx8fDE3NzUxNTE2MTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    excerpt: "Embracing a slower pace of life to cultivate deeper experiences and more meaningful connections.",
    author: "Sophie Laurent"
  },
];

function AttentionScoreBadge({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "bg-primary";
    if (score >= 0.8) return "bg-accent";
    return "bg-secondary";
  };

  return (
    <div className={`${getScoreColor(score)} text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm`}>
      <TrendingUp className="w-3.5 h-3.5" />
      <span className="text-sm font-medium">{score.toFixed(2)}</span>
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl mb-6 tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
          Mindful Content,<br />Curated for You
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Break free from doom-scrolling. Every piece of content is analyzed by our AI to ensure it's worthy of your valuable attention.
        </p>
        
        {/* Mobile App CTA */}
        <div className="flex gap-4 justify-center flex-wrap">
          <button 
            onClick={() => navigate('/navigation-demo')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#51CF66] to-[#34D399] text-white rounded-full hover:shadow-2xl transition-all text-lg font-bold"
          >
            <Menu className="w-6 h-6" />
            View Navigation System
          </button>
          <button 
            onClick={() => navigate('/mobile-guide')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white rounded-full hover:shadow-2xl transition-all text-lg font-bold"
          >
            <Map className="w-6 h-6" />
            View User Flow Guide
          </button>
          <button 
            onClick={() => navigate('/mobile/feed')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] text-white rounded-full hover:shadow-2xl transition-all text-lg font-bold"
          >
            <Smartphone className="w-6 h-6" />
            Experience Mobile App
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>42</h3>
          </div>
          <p className="text-sm text-muted-foreground">Articles Read This Week</p>
        </div>
        <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>4.2h</h3>
          </div>
          <p className="text-sm text-muted-foreground">Focused Reading Time</p>
        </div>
        <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>0.89</h3>
          </div>
          <p className="text-sm text-muted-foreground">Avg. Attention Score</p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group cursor-pointer bg-card/60 backdrop-blur-sm rounded-3xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <ImageWithFallback
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4">
                <AttentionScoreBadge score={post.attentionScore} />
              </div>
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 bg-background/90 backdrop-blur-sm text-xs rounded-full border border-border">
                  {post.category}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <h2 className="text-xl leading-snug group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">{post.author}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}