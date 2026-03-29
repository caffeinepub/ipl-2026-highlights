import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

actor {
  type Team = Text;

  type Player = {
    name : Text;
    team : Team;
    role : PlayerRole;
    stats : PlayerStats;
  };

  type PlayerRole = {
    #batsman;
    #bowler;
    #allRounder;
    #wicketKeeper;
  };

  type PlayerStats = {
    matches : Nat;
    runs : Nat;
    wickets : Nat;
    average : Float;
  };

  type MatchResult = {
    team1 : Team;
    team2 : Team;
    score1 : Nat;
    score2 : Nat;
    winner : Team;
    date : Text;
    venue : Text;
  };

  type VideoHighlight = {
    title : Text;
    thumbnail : Text;
    description : Text;
    duration : Text;
    views : Nat;
    url : Text;
  };

  type Photo = {
    title : Text;
    description : Text;
    match : Text;
    url : Text;
  };

  module MatchResult {
    public func compare(match1 : MatchResult, match2 : MatchResult) : Order.Order {
      Text.compare(match1.date, match2.date);
    };
  };

  module VideoHighlight {
    public func compare(video1 : VideoHighlight, video2 : VideoHighlight) : Order.Order {
      Text.compare(video1.title, video2.title);
    };
  };

  module Photo {
    public func compare(photo1 : Photo, photo2 : Photo) : Order.Order {
      Text.compare(photo1.title, photo2.title);
    };
  };

  let matches = Map.empty<Nat, MatchResult>();
  let videoHighlights = Map.empty<Nat, VideoHighlight>();
  let topPerformers = Map.empty<Nat, Player>();
  let photoGallery = Map.empty<Nat, Photo>();

  var matchId = 1;
  var highlightId = 1;
  var performerId = 1;
  var photoId = 1;

  // Admin principal (replace with actual admin principal)
  let adminPrincipal = Principal.fromText("2vxsx-fae");

  func onlyAdmin(caller : Principal) {
    if (caller != adminPrincipal) {
      Runtime.trap("Unauthorized access: Only admin can perform this operation.");
    };
  };

  // Add or update match result
  public shared ({ caller }) func addOrUpdateMatch(match : MatchResult) : async () {
    onlyAdmin(caller);
    matches.add(matchId, match);
    matchId += 1;
  };

  // Add or update video highlight
  public shared ({ caller }) func addOrUpdateVideoHighlight(highlight : VideoHighlight) : async () {
    onlyAdmin(caller);
    videoHighlights.add(highlightId, highlight);
    highlightId += 1;
  };

  // Add or update top performer
  public shared ({ caller }) func addOrUpdateTopPerformer(player : Player) : async () {
    onlyAdmin(caller);
    topPerformers.add(performerId, player);
    performerId += 1;
  };

  // Add or update photo
  public shared ({ caller }) func addOrUpdatePhoto(photo : Photo) : async () {
    onlyAdmin(caller);
    photoGallery.add(photoId, photo);
    photoId += 1;
  };

  // Public queries
  public query ({ caller }) func getAllMatchResults() : async [MatchResult] {
    matches.values().toArray().sort();
  };

  public query ({ caller }) func getAllVideoHighlights() : async [VideoHighlight] {
    videoHighlights.values().toArray().sort();
  };

  public query ({ caller }) func getAllTopPerformers() : async [Player] {
    topPerformers.values().toArray();
  };

  public query ({ caller }) func getAllPhotos() : async [Photo] {
    photoGallery.values().toArray().sort();
  };

  public query ({ caller }) func getMatchById(id : Nat) : async ?MatchResult {
    matches.get(id);
  };

  public query ({ caller }) func getVideoHighlightById(id : Nat) : async ?VideoHighlight {
    videoHighlights.get(id);
  };

  public query ({ caller }) func getTopPerformerById(id : Nat) : async ?Player {
    topPerformers.get(id);
  };

  public query ({ caller }) func getPhotoById(id : Nat) : async ?Photo {
    photoGallery.get(id);
  };
};
