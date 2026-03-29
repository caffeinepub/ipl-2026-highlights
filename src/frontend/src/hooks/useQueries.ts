import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MatchResult, Photo, Player, VideoHighlight } from "../backend.d";
import { PlayerRole } from "../backend.d";
import { useActor } from "./useActor";

export function useMatchResults() {
  const { actor, isFetching } = useActor();
  return useQuery<MatchResult[]>({
    queryKey: ["matchResults"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMatchResults();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVideoHighlights() {
  const { actor, isFetching } = useActor();
  return useQuery<VideoHighlight[]>({
    queryKey: ["videoHighlights"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideoHighlights();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTopPerformers() {
  const { actor, isFetching } = useActor();
  return useQuery<Player[]>({
    queryKey: ["topPerformers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTopPerformers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePhotos() {
  const { actor, isFetching } = useActor();
  return useQuery<Photo[]>({
    queryKey: ["photos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPhotos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSeedData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) return;
      const [matches, videos, performers, photos] = await Promise.all([
        actor.getAllMatchResults(),
        actor.getAllVideoHighlights(),
        actor.getAllTopPerformers(),
        actor.getAllPhotos(),
      ]);

      const promises: Promise<void>[] = [];

      if (matches.length === 0) {
        const matchData: MatchResult[] = [
          {
            team1: "MI",
            team2: "CSK",
            venue: "Wankhede Stadium",
            date: "Apr 5, 2026",
            score1: BigInt(187),
            score2: BigInt(165),
            winner: "MI",
          },
          {
            team1: "RCB",
            team2: "DC",
            venue: "Chinnaswamy Stadium",
            date: "Apr 7, 2026",
            score1: BigInt(210),
            score2: BigInt(198),
            winner: "RCB",
          },
          {
            team1: "KKR",
            team2: "RR",
            venue: "Eden Gardens",
            date: "Apr 9, 2026",
            score1: BigInt(178),
            score2: BigInt(182),
            winner: "RR",
          },
        ];
        promises.push(...matchData.map((m) => actor.addOrUpdateMatch(m)));
      }

      if (videos.length === 0) {
        const videoData: VideoHighlight[] = [
          {
            url: "",
            title: "MI vs CSK - Epic Final Over Finish",
            duration: "8:45",
            thumbnail: "",
            views: BigInt(1200000),
            description:
              "Thrilling last-over finish between the two giants of IPL",
          },
          {
            url: "",
            title: "Virat's Stunning Century",
            duration: "12:16",
            thumbnail: "",
            views: BigInt(2500000),
            description:
              "Virat Kohli's masterclass century against Delhi Capitals",
          },
          {
            url: "",
            title: "KKR's Record-Breaking Partnership",
            duration: "6:30",
            thumbnail: "",
            views: BigInt(890000),
            description:
              "KKR batters smash records with an incredible partnership",
          },
          {
            url: "",
            title: "Top 10 Catches of IPL 2026",
            duration: "15:20",
            thumbnail: "",
            views: BigInt(3100000),
            description:
              "The most spectacular catches taken in IPL 2026 so far",
          },
        ];
        promises.push(
          ...videoData.map((v) => actor.addOrUpdateVideoHighlight(v)),
        );
      }

      if (performers.length === 0) {
        const performerData: Player[] = [
          {
            name: "Rohit Sharma",
            role: PlayerRole.batsman,
            team: "MI",
            stats: {
              runs: BigInt(456),
              average: 38.2,
              matches: BigInt(12),
              wickets: BigInt(0),
            },
          },
          {
            name: "Jasprit Bumrah",
            role: PlayerRole.bowler,
            team: "MI",
            stats: {
              runs: BigInt(0),
              average: 0,
              matches: BigInt(9),
              wickets: BigInt(18),
            },
          },
          {
            name: "Virat Kohli",
            role: PlayerRole.batsman,
            team: "RCB",
            stats: {
              runs: BigInt(512),
              average: 42.7,
              matches: BigInt(12),
              wickets: BigInt(0),
            },
          },
          {
            name: "Rashid Khan",
            role: PlayerRole.bowler,
            team: "GT",
            stats: {
              runs: BigInt(0),
              average: 0,
              matches: BigInt(12),
              wickets: BigInt(21),
            },
          },
        ];
        promises.push(
          ...performerData.map((p) => actor.addOrUpdateTopPerformer(p)),
        );
      }

      if (photos.length === 0) {
        const photoData: Photo[] = [
          {
            url: "",
            match: "MI vs CSK Apr 5",
            title: "MI vs CSK Final Over",
            description: "The crowd goes wild as MI clinch a thriller",
          },
          {
            url: "",
            match: "RCB vs DC Apr 7",
            title: "Virat Century Celebration",
            description: "Virat Kohli celebrates his magnificent hundred",
          },
          {
            url: "",
            match: "KKR vs RR Apr 9",
            title: "KKR Fans Celebration",
            description: "Eden Gardens erupts as KKR fans celebrate",
          },
          {
            url: "",
            match: "Season Opener",
            title: "IPL 2026 Opening Ceremony",
            description: "A spectacular start to the IPL 2026 season",
          },
        ];
        promises.push(...photoData.map((p) => actor.addOrUpdatePhoto(p)));
      }

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matchResults"] });
      queryClient.invalidateQueries({ queryKey: ["videoHighlights"] });
      queryClient.invalidateQueries({ queryKey: ["topPerformers"] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}
