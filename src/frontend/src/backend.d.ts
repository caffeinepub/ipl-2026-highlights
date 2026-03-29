import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    name: string;
    role: PlayerRole;
    team: Team;
    stats: PlayerStats;
}
export type Team = string;
export interface VideoHighlight {
    url: string;
    title: string;
    duration: string;
    thumbnail: string;
    views: bigint;
    description: string;
}
export interface MatchResult {
    team1: Team;
    team2: Team;
    venue: string;
    date: string;
    score1: bigint;
    score2: bigint;
    winner: Team;
}
export interface PlayerStats {
    runs: bigint;
    average: number;
    matches: bigint;
    wickets: bigint;
}
export interface Photo {
    url: string;
    match: string;
    title: string;
    description: string;
}
export enum PlayerRole {
    allRounder = "allRounder",
    bowler = "bowler",
    wicketKeeper = "wicketKeeper",
    batsman = "batsman"
}
export interface backendInterface {
    addOrUpdateMatch(match: MatchResult): Promise<void>;
    addOrUpdatePhoto(photo: Photo): Promise<void>;
    addOrUpdateTopPerformer(player: Player): Promise<void>;
    addOrUpdateVideoHighlight(highlight: VideoHighlight): Promise<void>;
    getAllMatchResults(): Promise<Array<MatchResult>>;
    getAllPhotos(): Promise<Array<Photo>>;
    getAllTopPerformers(): Promise<Array<Player>>;
    getAllVideoHighlights(): Promise<Array<VideoHighlight>>;
    getMatchById(id: bigint): Promise<MatchResult | null>;
    getPhotoById(id: bigint): Promise<Photo | null>;
    getTopPerformerById(id: bigint): Promise<Player | null>;
    getVideoHighlightById(id: bigint): Promise<VideoHighlight | null>;
}
