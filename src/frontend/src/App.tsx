import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Award,
  ChevronRight,
  Eye,
  Menu,
  Play,
  Star,
  Trophy,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { MatchResult, Photo, Player, VideoHighlight } from "./backend.d";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useMatchResults,
  usePhotos,
  useSeedData,
  useTopPerformers,
  useVideoHighlights,
} from "./hooks/useQueries";

// --- Team color map ---
const teamColors: Record<string, { bg: string; text: string; border: string }> =
  {
    MI: { bg: "bg-blue-600", text: "text-white", border: "border-blue-500" },
    CSK: {
      bg: "bg-yellow-500",
      text: "text-gray-900",
      border: "border-yellow-400",
    },
    RCB: { bg: "bg-red-600", text: "text-white", border: "border-red-500" },
    DC: { bg: "bg-blue-700", text: "text-white", border: "border-blue-600" },
    KKR: {
      bg: "bg-purple-700",
      text: "text-white",
      border: "border-purple-500",
    },
    RR: { bg: "bg-pink-600", text: "text-white", border: "border-pink-500" },
    GT: {
      bg: "bg-yellow-600",
      text: "text-white",
      border: "border-yellow-500",
    },
    SRH: {
      bg: "bg-orange-600",
      text: "text-white",
      border: "border-orange-500",
    },
    LSG: { bg: "bg-teal-600", text: "text-white", border: "border-teal-500" },
    PBKS: { bg: "bg-red-700", text: "text-white", border: "border-red-600" },
  };

const getTeamColor = (team: string) =>
  teamColors[team] || {
    bg: "bg-gray-600",
    text: "text-white",
    border: "border-gray-500",
  };

const cardAccents = [
  "border-t-blue-500",
  "border-t-red-500",
  "border-t-yellow-400",
];

const videoGradients = [
  "from-blue-900 to-blue-950",
  "from-red-900 to-red-950",
  "from-purple-900 to-purple-950",
  "from-teal-900 to-teal-950",
];

const galleryGradients = [
  "from-blue-800 via-blue-900 to-slate-900",
  "from-red-800 via-red-900 to-slate-900",
  "from-purple-800 via-purple-900 to-slate-900",
  "from-yellow-700 via-yellow-900 to-slate-900",
];

function formatViews(views: bigint): string {
  const n = Number(views);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function TeamAvatar({
  team,
  size = "md",
}: { team: string; size?: "sm" | "md" | "lg" }) {
  const colors = getTeamColor(team);
  const sizeClass =
    size === "sm"
      ? "w-8 h-8 text-xs"
      : size === "lg"
        ? "w-14 h-14 text-base"
        : "w-11 h-11 text-sm";
  return (
    <div
      className={`${sizeClass} ${colors.bg} ${colors.text} rounded-full flex items-center justify-center font-bold uppercase shrink-0`}
    >
      {team}
    </div>
  );
}

function ScoreSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-48 w-full rounded-xl bg-muted/40" />
      ))}
    </div>
  );
}

function LiveDot() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
      </span>
    </span>
  );
}

function MatchCard({ match, index }: { match: MatchResult; index: number }) {
  const accent = cardAccents[index % cardAccents.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-card rounded-xl border border-border border-t-4 ${accent} shadow-card flex flex-col p-5 gap-4`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {match.venue}
        </span>
        <span className="text-xs text-muted-foreground">{match.date}</span>
      </div>
      <div className="flex items-center gap-3 justify-between">
        <div className="flex flex-col items-center gap-2">
          <TeamAvatar team={match.team1} size="lg" />
          <span className="text-sm font-bold text-foreground">
            {match.team1}
          </span>
        </div>
        <div className="flex-1 text-center">
          <div className="text-2xl font-extrabold text-foreground tabular-nums">
            {match.score1.toString()}
            <span className="text-muted-foreground text-base">/4</span>
            <span className="text-muted-foreground text-lg mx-2">vs</span>
            {match.score2.toString()}
            <span className="text-muted-foreground text-base">/8</span>
          </div>
          {match.winner && (
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gold/10 text-gold border border-gold/30">
              <Award className="w-3 h-3" />
              {match.winner} Won
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <TeamAvatar team={match.team2} size="lg" />
          <span className="text-sm font-bold text-foreground">
            {match.team2}
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full border-border/50 text-muted-foreground hover:text-foreground hover:border-gold/50 hover:text-gold transition-colors text-xs font-semibold tracking-wide uppercase"
        data-ocid="match.button"
      >
        Live Details
        <ChevronRight className="w-3.5 h-3.5 ml-1" />
      </Button>
    </motion.div>
  );
}

function VideoCard({ video, index }: { video: VideoHighlight; index: number }) {
  const gradient = videoGradients[index % videoGradients.length];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      className="bg-card rounded-xl border border-border overflow-hidden shadow-card group cursor-pointer hover:border-gold/40 transition-colors"
      data-ocid={`video.item.${index + 1}`}
    >
      <div
        className={`relative bg-gradient-to-br ${gradient} h-36 flex items-center justify-center`}
      >
        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-gold/20 group-hover:border-gold/40 transition-colors">
          <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
        </div>
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">
          {video.duration}
        </span>
      </div>
      <div className="p-3">
        <h4 className="text-sm font-semibold text-foreground line-clamp-2 mb-1">
          {video.title}
        </h4>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="w-3 h-3" />
          <span>{formatViews(video.views)} views</span>
        </div>
      </div>
    </motion.div>
  );
}

function PlayerRow({ player, index }: { player: Player; index: number }) {
  const colors = getTeamColor(player.team);
  const isBatsman = player.role === "batsman";
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex items-center gap-3 py-3 border-b border-border/50 last:border-b-0"
      data-ocid={`performers.item.${index + 1}`}
    >
      <div
        className={`w-10 h-10 ${colors.bg} ${colors.text} rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0`}
      >
        {player.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-foreground truncate">
          {player.name}
        </div>
        <div className="text-xs text-muted-foreground">
          <span
            className={`inline-block px-1.5 py-0 rounded text-[10px] font-bold mr-1 ${colors.bg} ${colors.text}`}
          >
            {player.team}
          </span>
          {player.role.charAt(0).toUpperCase() + player.role.slice(1)}
        </div>
      </div>
      <div className="text-right shrink-0">
        {isBatsman ? (
          <>
            <div className="text-sm font-extrabold text-gold">
              {player.stats.runs.toString()}
            </div>
            <div className="text-[10px] text-muted-foreground">
              runs · avg {player.stats.average.toFixed(1)}
            </div>
          </>
        ) : (
          <>
            <div className="text-sm font-extrabold text-gold">
              {player.stats.wickets.toString()}
            </div>
            <div className="text-[10px] text-muted-foreground">wickets</div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function GalleryCard({ photo, index }: { photo: Photo; index: number }) {
  const gradient = galleryGradients[index % galleryGradients.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`rounded-xl bg-gradient-to-br ${gradient} overflow-hidden shadow-card border border-border group cursor-pointer hover:border-gold/30 transition-colors`}
      data-ocid={`gallery.item.${index + 1}`}
    >
      <div className="h-40 flex items-center justify-center">
        <Star className="w-8 h-8 text-white/20 group-hover:text-gold/40 transition-colors" />
      </div>
      <div className="p-3 bg-black/30">
        <div className="text-sm font-bold text-foreground line-clamp-1">
          {photo.title}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {photo.match}
        </div>
      </div>
    </motion.div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg sm:text-xl font-extrabold text-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
      <span className="w-1 h-5 bg-gold rounded-full inline-block" />
      {children}
    </h2>
  );
}

const NAV_LINKS = ["LIVE", "SCORES", "MATCHES", "PLAYERS", "TEAMS"];
const NAV_ANCHORS: Record<string, string> = {
  LIVE: "#results",
  SCORES: "#results",
  MATCHES: "#videos",
  PLAYERS: "#performers",
  TEAMS: "#gallery",
};
const FOOTER_LINKS = ["Live", "Scores", "Matches", "Players", "Teams"];

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { actor, isFetching: actorFetching } = useActor();
  const { login, loginStatus, identity, clear } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const matchQuery = useMatchResults();
  const videoQuery = useVideoHighlights();
  const performerQuery = useTopPerformers();
  const photoQuery = usePhotos();
  const seedMutation = useSeedData();

  const {
    mutate: seedMutate,
    isPending: seedPending,
    isSuccess: seedSuccess,
  } = seedMutation;

  useEffect(() => {
    if (actor && !actorFetching && !seedPending && !seedSuccess) {
      seedMutate();
    }
  }, [actor, actorFetching, seedPending, seedSuccess, seedMutate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 shadow-lg"
        style={{ backgroundColor: "oklch(0.18 0.04 240)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2 shrink-0"
            data-ocid="nav.link"
          >
            <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center shadow-glow">
              <Trophy className="w-5 h-5 text-gray-900" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-foreground tracking-tight">
                IPL
              </span>
              <span className="text-base font-extrabold text-gold tracking-tight">
                2026
              </span>
              <span className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                <LiveDot />
                LIVE
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={NAV_ANCHORS[link]}
                className="px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-gold transition-colors tracking-wider rounded-md hover:bg-muted/30"
                data-ocid="nav.link"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Auth CTA */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Button
                size="sm"
                variant="outline"
                className="hidden sm:flex border-border/60 text-foreground hover:border-gold/50 hover:text-gold text-xs font-semibold"
                onClick={() => clear()}
                data-ocid="auth.button"
              >
                Logout
              </Button>
            ) : (
              <Button
                size="sm"
                className="hidden sm:flex gold-gradient text-gray-900 font-bold hover:opacity-90 text-xs tracking-wide"
                onClick={() => login()}
                disabled={loginStatus === "logging-in"}
                data-ocid="auth.button"
              >
                {loginStatus === "logging-in" ? "Logging in..." : "LOGIN"}
              </Button>
            )}
            <button
              type="button"
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              data-ocid="nav.toggle"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/50 px-4 py-3"
              style={{ backgroundColor: "oklch(0.18 0.04 240)" }}
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href={NAV_ANCHORS[link]}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-semibold text-muted-foreground hover:text-gold tracking-wider"
                  data-ocid="nav.link"
                >
                  {link}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero */}
      <section
        className="relative pt-16 min-h-[520px] sm:min-h-[600px] flex items-center"
        style={{
          backgroundImage:
            "url('/assets/generated/ipl-hero-stadium.dim_1400x600.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Badge className="mb-4 bg-red-500/20 text-red-400 border-red-500/40 text-xs font-bold tracking-widest px-3 py-1 inline-flex items-center gap-2">
              <LiveDot />
              SEASON 2026 • LIVE NOW
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-foreground mb-4 leading-tight tracking-tight">
              IPL <span className="text-gold">2026</span>
              <br />
              <span className="text-3xl sm:text-5xl font-bold text-red-400">
                LIVE
              </span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8">
              Live scores, match updates, top performers and latest action from
              IPL 2026.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="gold-gradient text-gray-900 font-bold hover:opacity-90 text-sm tracking-wide"
                data-ocid="hero.primary_button"
              >
                <Play className="w-4 h-4 mr-2" fill="currentColor" />
                LIVE SCORES
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-foreground hover:border-gold/50 hover:text-gold font-semibold text-sm tracking-wide"
                data-ocid="hero.secondary_button"
              >
                MATCH SCHEDULE
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section 1: Live & Recent Matches */}
        <section id="results" className="py-14">
          <SectionTitle>Live &amp; Recent Matches</SectionTitle>
          {matchQuery.isLoading ? (
            <ScoreSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(matchQuery.data || []).map((match, i) => (
                <MatchCard
                  key={`${match.team1}-${match.team2}`}
                  match={match}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Match Highlights + Top Performers */}
        <section id="videos" className="py-14 border-t border-border/30">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Videos */}
            <div className="lg:col-span-2">
              <SectionTitle>Match Highlights</SectionTitle>
              {videoQuery.isLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-48 rounded-xl bg-muted/40" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(videoQuery.data || []).map((video, i) => (
                    <VideoCard key={video.title} video={video} index={i} />
                  ))}
                </div>
              )}
            </div>

            {/* Top Performers */}
            <div id="performers">
              <SectionTitle>Top Performers</SectionTitle>
              <div className="bg-card rounded-xl border border-border shadow-card p-4">
                {performerQuery.isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton
                        key={i}
                        className="h-14 rounded-lg bg-muted/40"
                      />
                    ))}
                  </div>
                ) : (
                  <div>
                    {(performerQuery.data || []).map((player, i) => (
                      <PlayerRow key={player.name} player={player} index={i} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Photo Gallery */}
        <section id="gallery" className="py-14 border-t border-border/30">
          <SectionTitle>Photo Gallery</SectionTitle>
          {photoQuery.isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-52 rounded-xl bg-muted/40" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(photoQuery.data || []).map((photo, i) => (
                <GalleryCard key={photo.title} photo={photo} index={i} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer
        className="border-t border-border/30 mt-8"
        style={{ backgroundColor: "oklch(0.15 0.03 240)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md gold-gradient flex items-center justify-center">
                <Trophy className="w-4 h-4 text-gray-900" />
              </div>
              <span className="font-extrabold text-foreground">
                IPL <span className="text-gold">2026</span>
              </span>
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                <LiveDot />
                LIVE
              </span>
            </div>
            <div className="flex gap-6 text-xs text-muted-foreground">
              {FOOTER_LINKS.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="hover:text-gold transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border/20 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
