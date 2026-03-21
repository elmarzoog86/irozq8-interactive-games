import React, { useState, useEffect } from "react";
import { TwitchChat } from "./components/TwitchChat";
import { TriviaGame } from "./components/TriviaGame";
import { FruitWar } from "./components/FruitWar";
import { ChairsGame } from "./components/ChairsGame";
import { RouletteGame } from "./components/RouletteGame";
import { WordChainGame } from "./components/WordChainGame";
import { ChatInvadersGame } from "./components/ChatInvadersGame";
import { PriceIsRightGame } from "./components/PriceIsRightGame";
import { HowManyGame } from "./components/HowManyGame";
import { HowManyPlayer } from "./components/HowManyPlayer";
import { TeamFeudGame } from "./components/TeamFeudGame";
import { CodeNamesGame } from "./components/CodeNamesGame";
import { MusicGuesserGame } from "./components/MusicGuesserGame";
import { BombRelayGame } from "./components/BombRelayGame";
import { BankRobberyGame } from "./components/BankRobberyGame";
import { ChatRoyaleGame } from "./components/ChatRoyaleGame";
import { TurfWarsGame } from "./components/TurfWarsGame";
import { TeamPlayer } from "./components/TeamPlayer";
import BankRobberyController from "./pages/BankRobberyController";
import { SnakesAndLaddersGame } from "./components/SnakesAndLaddersGame";
import { TypingDerbyGame } from "./components/TypingDerbyGame";
import { TypingRoyaleGame } from "./components/TypingRoyaleGame";
import { MissingLinkGame } from "./components/MissingLinkGame";
import { ScattergoriesGame } from "./components/ScattergoriesGame";
import CategoryAuctionGame from "./components/CategoryAuctionGame";
import TrivialPursuitGame from "./components/TrivialPursuitGame";
import { HotPotatoGame } from "./components/HotPotatoGame";
import { useTwitchChat } from "./hooks/useTwitchChat";
import { motion, AnimatePresence } from "motion/react";
import {
  Target,
  Crown,
  Info,
  Sparkles,
  ArrowLeft,
  HelpCircle,
  Swords,
  Armchair,
  Hourglass,
  Twitch,
  Heart,
  MessageCircle,
  MessageSquareText,
  Rocket,
  Tag,
  Skull,
  Music,
  Bomb,
  Banknote,
} from "lucide-react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import AdminControlBoard from "./pages/Admin";
import ComingSoon from "./ComingSoon";
import AddMusic from "./pages/AddMusic";
import MusicRequests from "./pages/MusicRequests";

import { socket } from "./socket";

// ==========================================
// SETTINGS
// ==========================================
// Set this to true to show the "Coming Soon" page for the entire site
// Set to false to show the main application
const ENABLE_COMING_SOON_PAGE = false;

export default function App() {
  // If maintenance mode is enabled, show the Coming Soon page
  // You can also add logic here to allow certain routes or query params to bypass it
  if (ENABLE_COMING_SOON_PAGE) {
    return <ComingSoon />;
  }

  return (
    <Routes>
      <Route path="/admin" element={<AdminControlBoard />} />
      <Route path="/add-music" element={<AddMusic />} />{" "}
      <Route path="/music-requests" element={<MusicRequests />} />
      <Route path="/howmany/:roomId" element={<HowManyPlayer />} />
      <Route path="/team/:roomId" element={<TeamPlayer />} />
      <Route path="/br/:roomId" element={<BankRobberyController />} />
      <Route
        path="/games/guess-song"
        element={
          <div className="relative">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-4 left-4 z-50"
              >
                <div
                  onClick={() => (window.location.href = "/")}
                  className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors cursor-pointer "
                >
                  <ArrowLeft size={24} />
                </div>
              </motion.div>
            </AnimatePresence>
            <MusicGuesserGame />
          </div>
        }
      />
      <Route path="*" element={<MainApp />} />
    </Routes>
  );
}

const GAMES = [
  {
    id: "bankrobbery",
    name: "Ø´Ø±Ø·ÙŠ Ø­Ø±Ø§Ù…ÙŠ",
    description:
      "Ù„Ø¹Ø¨Ø© Ø®Ø¯Ø§Ø¹ ÙˆØªØµÙˆÙŠØª! ÙƒÙˆÙ†ÙˆØ§ ÙØ±ÙŠÙ‚Ø§Ù‹ Ù„Ø³Ø±Ù‚Ø© Ø§Ù„Ø¨Ù†ÙƒØŒ Ù„ÙƒÙ† Ø§Ø­Ø°Ø±ÙˆØ§ Ù…Ù† Ø§Ù„Ø´Ø±Ø·Ø© Ø§Ù„Ù…ØªØ®ÙÙŠÙ† Ø¨ÙŠÙ†ÙƒÙ….",
    tutorial:
      "Ø§Ù…Ø³Ø­ Ø§Ù„ÙƒÙˆØ¯ Ù„Ù„Ø¯Ø®ÙˆÙ„ ÙƒØ­Ø±Ø§Ù…ÙŠ. Ø¥Ø°Ø§ ÙƒÙ†Øª Ø¶Ù…Ù† Ø§Ù„Ø¹ØµØ§Ø¨Ø©ØŒ Ø­Ø§ÙˆÙ„ Ø³Ø±Ù‚Ø© Ø§Ù„Ø®Ø²Ù†Ø§Øª. Ø¥Ø°Ø§ ÙƒÙ†Øª Ø´Ø±Ø·ÙŠØŒ Ø­Ø§ÙˆÙ„ Ø¥ÙØ´Ø§Ù„ Ø§Ù„Ù…Ù‡Ù…Ø© Ø¯ÙˆÙ† Ø£Ù† ØªÙÙƒØ´Ù.",
    image: "/bankrobbery.png",
    status: "testing",
    type: "strategy",
    color: "red",
  },
  {
    id: "hotpotato",
    name: "Ø§Ù„Ø¨Ø·Ø§Ø·Ø§ Ø§Ù„Ø³Ø§Ø®Ù†Ø©",
    description:
      "Ù„Ø¹Ø¨Ø© Ø§Ù„Ø³Ø±Ø¹Ø© ÙˆØ§Ù„Ø£Ø³Ø¦Ù„Ø©! Ø£Ø¬Ø¨ Ø¨Ø³Ø±Ø¹Ø© Ù„ØªÙ…Ø±ÙŠØ± Ø§Ù„Ù‚Ù†Ø¨Ù„Ø© Ø§Ù„Ù…ÙˆÙ‚ÙˆØªØ© Ù‚Ø¨Ù„ Ø£Ù† ØªÙ†Ù‚Ø¶ÙŠ Ù¢Ù  Ø«Ø§Ù†ÙŠØ©!",
    tutorial:
      "Ø¹Ù†Ø¯Ù…Ø§ ØªÙƒÙˆÙ† Ø§Ù„Ù‚Ù†Ø¨Ù„Ø© Ø¨ÙŠØ¯ÙƒØŒ Ø£Ø¬Ø¨ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø¤Ø§Ù„ ÙÙŠ Ø§Ù„Ø´Ø§Øª Ù„ØªÙ…Ø±ÙŠØ±Ù‡Ø§ Ù„Ù„Ø§Ø¹Ø¨ Ø¢Ø®Ø±.",
    image: "/HotPotato.png",
    status: "testing",
    type: "action",
    color: "red",
  },
  {
    id: "trivia",
    name: "Ø³ÙŠÙ† Ø¬ÙŠÙ…",
    description:
      "Ø§Ø®ØªØ¨Ø± Ù…Ø¹Ù„ÙˆÙ…Ø§ØªÙƒ Ø§Ù„Ø¹Ø§Ù…Ø© ÙÙŠ Ù…Ø³Ø§Ø¨Ù‚Ø© Ø«Ù‚Ø§ÙÙŠØ© Ø³Ø±ÙŠØ¹Ø©. Ø£Ø¬Ø¨ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ø³Ø¦Ù„Ø© ÙÙŠ Ø§Ù„Ø¯Ø±Ø¯Ø´Ø© ÙˆØ§Ø¬Ù…Ø¹ Ø§Ù„Ù†Ù‚Ø§Ø· Ù„ØªØªØµØ¯Ø± Ù„ÙˆØ­Ø© Ø§Ù„ØµØ¯Ø§Ø±Ø©.",
    tutorial:
      "Ø§ÙƒØªØ¨ Ø±Ù‚Ù… Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„ØµØ­ÙŠØ­Ø© ÙÙŠ Ø§Ù„Ø¯Ø±Ø¯Ø´Ø© (1ØŒ 2ØŒ 3ØŒ Ø£Ùˆ 4). ÙƒÙ„Ù…Ø§ Ø£Ø¬Ø¨Øª Ø£Ø³Ø±Ø¹ØŒ Ø­ØµÙ„Øª Ø¹Ù„Ù‰ Ù†Ù‚Ø§Ø· Ø£ÙƒØ«Ø±!",
    image: "/trivia.png",
    status: "active",
    type: "puzzles",
    color: "yellow",
  },
  {
    id: "teamfeud",
    name: "ØªØ­Ø¯ÙŠ Ø§Ù„ÙØ±Ù‚",
    description:
      "Ø§Ù†Ù‚Ø³Ù…ÙˆØ§ Ø¥Ù„Ù‰ ÙØ±ÙŠÙ‚ÙŠÙ† ÙˆØ­Ø§ÙˆÙ„ÙˆØ§ ØªØ®Ù…ÙŠÙ† Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø§Øª Ø§Ù„Ø£ÙƒØ«Ø± Ø´ÙŠÙˆØ¹Ø§Ù‹ Ø¨ÙŠÙ† Ø§Ù„Ù†Ø§Ø³. Ù‡Ù„ ØªØ³ØªØ·ÙŠØ¹ Ø£Ù†Øª ÙˆÙØ±ÙŠÙ‚Ùƒ Ø§Ù„Ø³ÙŠØ·Ø±Ø© Ø¹Ù„Ù‰ Ø§Ù„Ù„ÙˆØ­Ø©ØŸ",
    tutorial:
      "Ø§ÙƒØªØ¨ Ø¥Ø¬Ø§Ø¨ØªÙƒ ÙÙŠ Ø§Ù„Ø¯Ø±Ø¯Ø´Ø©. Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø¥Ø¬Ø§Ø¨ØªÙƒ Ù…Ù† Ø¶Ù…Ù† Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø§Øª Ø§Ù„Ø£ÙƒØ«Ø± Ø´ÙŠÙˆØ¹Ø§Ù‹ØŒ Ø³ØªØ­ØµÙ„ Ø¹Ù„Ù‰ Ù†Ù‚Ø§Ø· Ù„ÙØ±ÙŠÙ‚Ùƒ.",
    image: "/teamfeud.png",
    status: "active",
    type: "puzzles",
    color: "blue",
  },
  {
    id: "priceisright",
    name: "Ø®Ù…Ù† Ø§Ù„Ø³Ø¹Ø±",
    description:
      "Ø§Ø³ØªØ¹Ø±Ø¶ Ù…Ù‡Ø§Ø±Ø§ØªÙƒ ÙÙŠ Ø§Ù„ØªØ³ÙˆÙ‚! Ø®Ù…Ù† Ø§Ù„Ø³Ø¹Ø± Ø§Ù„ØµØ­ÙŠØ­ Ù„Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ù…Ø¹Ø±ÙˆØ¶Ø©. Ø§Ù„ÙØ§Ø¦Ø² Ù‡Ùˆ Ù…Ù† ÙŠÙ‚ØªØ±Ø¨ Ù…Ù† Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠ Ø¯ÙˆÙ† ØªØ¬Ø§ÙˆØ²Ù‡.",
    tutorial:
      "Ø§ÙƒØªØ¨ Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ø°ÙŠ ØªØªÙˆÙ‚Ø¹Ù‡ ÙÙŠ Ø§Ù„Ø¯Ø±Ø¯Ø´Ø©. ÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† Ø§Ù„Ø³Ø¹Ø± Ù‚Ø±ÙŠØ¨Ø§Ù‹ Ù…Ù† Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠ Ø¯ÙˆÙ† Ø£Ù† ÙŠØªØ¬Ø§ÙˆØ²Ù‡.",
    image: "/priceisright.png",
    status: "active",
    type: "puzzles",
    color: "green",
  },
  {
    id: "fruitwar",
    name: "Ø­Ø±Ø¨ Ø§Ù„ÙÙˆØ§ÙƒÙ‡",
    description:
      "Ø§Ø®ØªØ± ÙØ§ÙƒÙ‡ØªÙƒ Ø§Ù„Ù…ÙØ¶Ù„Ø© ÙˆØ§Ø³ØªØ¹Ø¯ Ù„Ù„Ù…Ø¹Ø±ÙƒØ©! Ù„Ø¹Ø¨Ø© Ø­Ù…Ø§Ø³ÙŠØ© ØªØ¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ ØªØµÙˆÙŠØª Ø§Ù„Ø¬Ù…Ù‡ÙˆØ± Ø£Ùˆ Ø§Ù„Ø­Ø¸ Ù„ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù†Ø§Ø¬ÙŠ Ø§Ù„Ø£Ø®ÙŠØ±.",
    tutorial:
      "Ø§ÙƒØªØ¨ Ø§Ø³Ù… Ø§Ù„ÙØ§ÙƒÙ‡Ø© Ø§Ù„ØªÙŠ ØªØ±ÙŠØ¯ Ø¯Ø¹Ù…Ù‡Ø§ ÙÙŠ Ø§Ù„Ø¯Ø±Ø¯Ø´Ø©. Ø§Ù„ÙØ§ÙƒÙ‡Ø© Ø§Ù„ØªÙŠ ØªØ­ØµÙ„ Ø¹Ù„Ù‰ Ø£Ù‚Ù„ Ø¹Ø¯Ø¯ Ù…Ù† Ø§Ù„Ø£ØµÙˆØ§Øª Ø£Ùˆ ÙŠØªÙ… Ø§Ø®ØªÙŠØ§Ø±Ù‡Ø§ ÙÙŠ Ø§Ù„Ø±ÙˆÙ„ÙŠØª ØªØ®Ø±Ø¬ Ù…Ù† Ø§Ù„Ù„Ø¹Ø¨Ø©.",
    image: "/fruitwar.png",
    status: "active",
    type: "action",
    color: "yellow",
  },

  {
    id: "howmany",
    name: "ÙƒÙ… ØªÙ‚Ø¯Ø± ØªØ³Ù…ÙŠØŸ",
    description:
      "ØªØ­Ø¯ÙŠ Ø§Ù„Ø°Ø§ÙƒØ±Ø© ÙˆØ§Ù„Ø³Ø±Ø¹Ø©. ÙƒÙ… Ø¹Ø¯Ø¯ Ø§Ù„Ø£Ø´ÙŠØ§Ø¡ Ø§Ù„ØªÙŠ ÙŠÙ…ÙƒÙ†Ùƒ ØªØ³Ù…ÙŠØªÙ‡Ø§ ÙÙŠ ÙØ¦Ø© Ù…Ø¹ÙŠÙ†Ø© Ù‚Ø¨Ù„ Ø£Ù† ÙŠØ³Ø¨Ù‚Ùƒ Ø§Ù„Ø¢Ø®Ø±ÙˆÙ†ØŸ",
    tutorial:
      "Ø§ÙƒØªØ¨ Ø£ÙƒØ¨Ø± Ø¹Ø¯Ø¯ Ù…Ù…ÙƒÙ† Ù…Ù† Ø§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ù„ØªÙŠ ØªÙ†ØªÙ…ÙŠ Ù„Ù„ÙØ¦Ø© Ø§Ù„Ù…Ø®ØªØ§Ø±Ø© ÙÙŠ Ø§Ù„Ø¯Ø±Ø¯Ø´Ø©. ÙƒÙ„ ÙƒÙ„Ù…Ø© ØµØ­ÙŠØ­Ø© ØªÙ…Ù†Ø­Ùƒ Ù†Ù‚Ø·Ø©.",
    image: "/howmany.png",
    status: "active",
    type: "puzzles",
    color: "blue",
  },
  {
    id: "codenames",
    name: "Ù„Ø¹Ø¨Ø© Ø§Ù„Ø´ÙØ±Ø©",
    description:
      "Ù„Ø¹Ø¨Ø© Ø§Ù„Ø°ÙƒØ§Ø¡ ÙˆØ§Ù„Ø§Ø±ØªØ¨Ø§Ø·Ø§Øª. Ø­Ø§ÙˆÙ„ ÙƒØ´Ù ÙƒÙ„Ù…Ø§Øª ÙØ±ÙŠÙ‚Ùƒ Ø§Ù„Ø³Ø±ÙŠØ© Ø¹Ø¨Ø± ØªÙ„Ù…ÙŠØ­Ø§Øª SpymasterØŒ Ù„ÙƒÙ† Ø§Ø­Ø°Ø± Ù…Ù† Ù„Ù…Ø³ ÙƒÙ„Ù…Ø© Ø§Ù„Ù‚Ø§ØªÙ„!",
    tutorial:
      "Ø§ÙƒØªØ¨ Ø§Ù„ÙƒÙ„Ù…Ø© Ø§Ù„ØªÙŠ ØªØ¹ØªÙ‚Ø¯ Ø£Ù†Ù‡Ø§ ØªÙ†ØªÙ…ÙŠ Ù„ÙØ±ÙŠÙ‚Ùƒ Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ ØªÙ„Ù…ÙŠØ­ Spymaster. ØªØ¬Ù†Ø¨ ÙƒÙ„Ù…Ø§Øª Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø¢Ø®Ø± ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ù‚Ø§ØªÙ„.",
    image: "/codenames.png",
    status: "active",
    type: "strategy",
    color: "red",
  },
  {
    id: "chairs",
    name: "Ù„Ø¹Ø¨Ø© Ø§Ù„ÙƒØ±Ø§Ø³ÙŠ",
    description:
      "Ø§Ù„Ù†Ø³Ø®Ø© Ø§Ù„Ø±Ù‚Ù…ÙŠØ© Ù…Ù† Ø§Ù„Ù„Ø¹Ø¨Ø© Ø§Ù„ÙƒÙ„Ø§Ø³ÙŠÙƒÙŠØ©. Ø§ÙƒØªØ¨ Ø±Ù‚Ù… Ø§Ù„ÙƒØ±Ø³ÙŠ Ø¨Ø³Ø±Ø¹Ø© ÙÙŠ Ø§Ù„Ø¯Ø±Ø¯Ø´Ø© Ù„ØªØ¶Ù…Ù† Ù…ÙƒØ§Ù†Ùƒ Ù‚Ø¨Ù„ Ø£Ù† ØªØªÙˆÙ‚Ù Ø§Ù„Ù…ÙˆØ³ÙŠÙ‚Ù‰!",
    tutorial:
      "Ø¹Ù†Ø¯Ù…Ø§ ØªØªÙˆÙ‚Ù Ø§Ù„Ù…ÙˆØ³ÙŠÙ‚Ù‰ØŒ Ø§ÙƒØªØ¨ Ø±Ù‚Ù… Ø§Ù„ÙƒØ±Ø³ÙŠ Ø§Ù„Ø®Ø§Ù„ÙŠ ÙÙŠ Ø§Ù„Ø¯Ø±Ø¯Ø´Ø© ÙÙˆØ±Ø§Ù‹. Ù…Ù† ÙŠØªØ¨Ù‚Ù‰ Ø¨Ø¯ÙˆÙ† ÙƒØ±Ø³ÙŠ ÙŠØ®Ø±Ø¬ Ù…Ù† Ø§Ù„Ù„Ø¹Ø¨Ø©.",
    image: "/chairs.png",
    status: "active",
    type: "action",
    color: "yellow",
    isNew: true,
  },
  {
    id: "roulette",
    name: "Ø±ÙˆÙ„ÙŠØª",
    description:
      "Ù„Ø¹Ø¨Ø© Ø§Ù„Ø­Ø¸ ÙˆØ§Ù„Ø¥Ù‚ØµØ§Ø¡. Ø§Ù†Ø¶Ù… Ù„Ù„Ø¹Ø¬Ù„Ø© ÙˆØ§Ù†ØªØ¸Ø± Ø¯ÙˆØ±Ùƒ. Ø¥Ø°Ø§ ØªÙ… Ø§Ø®ØªÙŠØ§Ø±ÙƒØŒ Ø³ØªÙ…ØªÙ„Ùƒ Ø§Ù„Ù‚ÙˆØ© Ù„Ø¥Ù‚ØµØ§Ø¡ Ù…Ù†Ø§ÙØ³ÙŠÙƒ Ø£Ùˆ Ø§Ù„Ù…Ø®Ø§Ø·Ø±Ø© Ø¨Ø§Ù„Ø¨Ù‚Ø§Ø¡.",
    tutorial:
      "Ø§Ù†Ø¶Ù… Ù„Ù„Ø±Ø¯Ù‡Ø© Ù„ÙŠØ¸Ù‡Ø± Ø§Ø³Ù…Ùƒ. Ø¥Ø°Ø§ Ø§Ø®ØªØ§Ø±ØªÙƒ Ø§Ù„Ø¹Ø¬Ù„Ø©ØŒ ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ø®ØªÙŠØ§Ø± Ù„Ø§Ø¹Ø¨ Ù„Ø¥Ù‚ØµØ§Ø¦Ù‡ Ø£Ùˆ Ø§Ù„Ù…Ø®Ø§Ø·Ø±Ø© Ø¨ÙØ±ØµØ© Ø¥Ø¶Ø§ÙÙŠØ©.",
    image: "/roulette.png",
    status: "active",
    type: "action",
    color: "yellow",
    isNew: true,
  },
  {
    id: "wordchain",
    name: "Ø³Ù„Ø³Ù„Ø© Ø§Ù„ÙƒÙ„Ù…Ø§Øª",
    description:
      "Ø§Ø®ØªØ¨Ø§Ø± Ù„Ø³Ø±Ø¹Ø© Ø§Ù„Ø¨Ø¯ÙŠÙ‡Ø© ÙˆØ§Ù„Ù…ÙØ±Ø¯Ø§Øª. Ø§Ø¨Ø¯Ø£ Ø¨ÙƒÙ„Ù…Ø©ØŒ ÙˆØ¹Ù„Ù‰ Ø§Ù„Ù„Ø§Ø¹Ø¨ Ø§Ù„ØªØ§Ù„ÙŠ Ø£Ù† ÙŠØ£ØªÙŠ Ø¨ÙƒÙ„Ù…Ø© ØªØ¨Ø¯Ø£ Ø¨Ø¢Ø®Ø± Ø­Ø±Ù. Ù„Ø§ ØªØªÙˆÙ‚Ù!",
    tutorial:
      "Ø§ÙƒØªØ¨ ÙƒÙ„Ù…Ø© ØªØ¨Ø¯Ø£ Ø¨Ø¢Ø®Ø± Ø­Ø±Ù Ù…Ù† Ø§Ù„ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø§Ø¨Ù‚Ø©. Ù„Ø¯ÙŠÙƒ ÙˆÙ‚Øª Ù…Ø­Ø¯ÙˆØ¯ Ù„Ù„Ø±Ø¯ Ù‚Ø¨Ù„ Ø£Ù† ØªØ®Ø³Ø±.",
    image: "/wordchain.png",
    status: "active",
    type: "puzzles",
    color: "blue",
    isNew: true,
  },
  {
    id: "guessmusic",
    name: "Ø®Ù…Ù† Ø§Ù„Ù…ÙˆØ³ÙŠÙ‚Ù‰",
    description:
      "Ù„Ù…Ø­Ø¨ÙŠ Ø§Ù„Ø£Ù„Ø­Ø§Ù†! Ø§Ø³ØªÙ…Ø¹ Ù„Ù„Ù…Ù‚Ø§Ø·Ø¹ Ø§Ù„Ù…ÙˆØ³ÙŠÙ‚ÙŠØ© ÙˆÙƒÙ† Ø§Ù„Ø£ÙˆÙ„ ÙÙŠ ØªØ®Ù…ÙŠÙ† Ø§Ø³Ù… Ø§Ù„Ø£ØºÙ†ÙŠØ© Ø£Ùˆ Ø§Ù„ÙÙ†Ø§Ù† ÙÙŠ Ø§Ù„Ø¯Ø±Ø¯Ø´Ø©.",
    tutorial:
      "Ø§Ø³ØªÙ…Ø¹ Ù„Ù„Ù…Ù‚Ø·Ø¹ Ø§Ù„Ù…ÙˆØ³ÙŠÙ‚ÙŠ ÙˆØ§ÙƒØªØ¨ Ø§Ø³Ù… Ø§Ù„Ø£ØºÙ†ÙŠØ© Ø£Ùˆ Ø§Ù„ÙÙ†Ø§Ù† ÙÙŠ Ø§Ù„Ø¯Ø±Ø¯Ø´Ø© Ø¨Ø£Ø³Ø±Ø¹ Ù…Ø§ ÙŠÙ…ÙƒÙ†.",
    image: "/guessmusic.png",
    status: "active",
    type: "puzzles",
    color: "yellow",
  },
  {
    id: "snakes",
    name: "Ø³Ù„Ø§Ù„Ù… ÙˆØ«Ø¹Ø§Ø¨ÙŠÙ†",
    description:
      "Ù„Ø¹Ø¨Ø© ÙƒÙ„Ø§Ø³ÙŠÙƒÙŠØ© Ø¨Ù„Ù…Ø³Ø© ØªÙØ§Ø¹Ù„ÙŠØ©! ØªÙ†Ø§ÙØ³ Ù…Ø¹ Ø§Ù„Ø¯Ø±Ø¯Ø´Ø© Ù„Ù„ÙˆØµÙˆÙ„ Ù„Ù„Ù‚Ù…Ø©ØŒ ÙˆØ§Ø­Ø°Ø± Ù…Ù† Ø§Ù„Ø«Ø¹Ø§Ø¨ÙŠÙ†!",
    tutorial:
      "Ø§ÙƒØªØ¨ !join Ù„Ù„Ø§Ù†Ø¶Ù…Ø§Ù…ØŒ ÙˆØ¹Ù†Ø¯Ù…Ø§ ÙŠØ£ØªÙŠ Ø¯ÙˆØ±Ùƒ Ø§ÙƒØªØ¨ !roll Ù„Ø±Ù…ÙŠ Ø§Ù„Ù†Ø±Ø¯.",
    image: "/snakesandladder.png",
    status: "active",
    type: "puzzles",
    color: "green",
  },
  {
    id: "typingderby",
    name: "Ø³Ø¨Ø§Ù‚ Ø§Ù„ÙƒØªØ§Ø¨Ø©",
    description:
      "Ù„Ø¹Ø¨Ø© Ø§Ù„Ø³Ø±Ø¹Ø© Ø§Ù„Ø§Ù†Ø¹ÙƒØ§Ø³ÙŠØ©! ÙƒÙ† Ø£ÙˆÙ„ Ù…Ù† ÙŠÙƒØªØ¨ Ø§Ù„Ø¬Ù…Ù„Ø© Ø§Ù„Ù…Ø¹Ø±ÙˆØ¶Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø´Ø§Ø´Ø© Ù„Ù„Ø§Ù†Ø·Ù„Ø§Ù‚ Ù†Ø­Ùˆ Ø®Ø· Ø§Ù„Ù†Ù‡Ø§ÙŠØ©.",
    tutorial:
      "Ø§ÙƒØªØ¨ !join Ù„Ù„Ø§Ù†Ø¶Ù…Ø§Ù…. ÙˆØ¹Ù†Ø¯Ù…Ø§ ØªØ¸Ù‡Ø± Ø§Ù„Ø¬Ù…Ù„Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø´Ø§Ø´Ù‡ØŒ Ø§ÙƒØªØ¨Ù‡Ø§ ÙÙŠ Ø§Ù„Ø´Ø§Øª Ø­Ø±ÙÙŠØ§ Ø¨Ø£Ø³Ø±Ø¹ Ù…Ø§ÙŠÙ…ÙƒÙ†.",
    image: "/typingderby.png",
    status: "active",
    type: "action",
    color: "blue",
    isNew: true,
  },
  {
    id: "typingroyale",
    name: "Ù…Ø¹Ø±ÙƒØ© Ø§Ù„ÙƒÙ„Ù…Ø§Øª",
    description:
      "Ø¨Ø§ØªÙ„ Ø±ÙˆÙŠØ§Ù„ Ø§Ù„ÙƒØªØ§Ø¨Ø©! Ø¨Ø·ÙˆÙ„Ø§Øª Ù…Ù† 3 Ø¬ÙˆÙ„Ø§ØªØŒ Ø§Ù„Ø£Ø¨Ø·Ø£ Ø³ÙŠØªÙ… Ø¥Ù‚ØµØ§Ø¤Ù‡ Ø­ØªÙ‰ ÙŠØ¨Ù‚Ù‰ Ù†Ø§Ø¬Ù ÙˆØ§Ø­Ø¯.",
    tutorial:
      "Ø§ÙƒØªØ¨ Ø§Ù„ÙƒÙ„Ù…Ø© Ø¨Ø£Ù‚ØµØ± ÙˆÙ‚Øª Ù…Ù…ÙƒÙ†ØŒ ØªØ¬Ù†Ø¨ Ø£Ù† ØªÙƒÙˆÙ† Ø§Ù„Ø£Ø¨Ø·Ø£ Ø¨ÙŠÙ† Ø§Ù„Ø¬Ù…ÙŠØ¹ Ù„Ù„Ù†Ø¬Ø§Ø© Ù…Ù† Ø§Ù„Ø¥Ù‚ØµØ§Ø¡!",
    image: "/typingroyale.png",
    status: "active",
    type: "action",
    color: "red",
    isNew: true,
  },
  {
    id: "missinglink",
    name: "Ø§Ù„Ø±Ø§Ø¨Ø· Ø§Ù„Ø¹Ø¬ÙŠØ¨",
    description:
      "Ø§Ø³ØªÙ†ØªØ¬ Ø§Ù„Ø±Ø§Ø¨Ø· Ø¨ÙŠÙ† Ø§Ù„ÙƒÙ„Ù…Ø§Øª ÙˆØ§Ù„ØµÙˆØ± Ø§Ù„Ù…Ø¹Ø±ÙˆØ¶Ø© Ø£Ù…Ø§Ù…Ùƒ Ø¨Ø£Ø³Ø±Ø¹ ÙˆÙ‚Øª Ù…Ù…ÙƒÙ†.",
    tutorial:
      "Ø§ÙƒØªØ¨ !join Ù„Ù„Ø§Ù†Ø¶Ù…Ø§Ù…. ÙˆØ¹Ù†Ø¯Ù…Ø§ ØªØ¸Ù‡Ø± Ù…Ø¬Ù…ÙˆØ¹Ø© ØµÙˆØ±ØŒ Ø§ÙƒØªØ¨ Ø§Ù„ØªØµÙ†ÙŠÙ Ø§Ù„Ø°ÙŠ ÙŠØ¬Ù…Ø¹Ù‡Ù… Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ù†Ù‚Ø·Ø©.",
    image: "/missinglink.png",
    status: "active",
    type: "puzzles",
    color: "yellow",
    isNew: true,
  },
  {
    id: "scattergories",
    name: "Ø­Ø±Ù ÙˆÙØ¦Ø©",
    description:
      "ÙØ¦Ø© Ù…Ø¹ÙŠÙ†Ø© ÙŠØ¨Ø¯Ø£ Ø¨Ø­Ø±Ù Ù…Ø­Ø¯Ø¯ØŸ Ø£Ø³Ø±Ø¹ Ø´Ø®Øµ ÙŠÙƒØªØ¨ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© ÙÙŠ Ø§Ù„Ø´Ø§Øª ÙŠÙÙˆØ²!",
    tutorial:
      "Ø¨Ø¯ÙˆÙ† Ø§Ù„Ø­Ø§Ø¬Ø© Ù„Ù„Ø§Ù†Ø¶Ù…Ø§Ù…! ÙÙ‚Ø· Ø§ÙƒØªØ¨ Ø§Ù„ÙƒÙ„Ù…Ø© Ø§Ù„ØµØ­ÙŠØ­Ø© Ø§Ù„ØªÙŠ ØªÙ†Ø·Ø¨Ù‚ Ø¹Ù„Ù‰ Ø§Ù„Ø­Ø±Ù ÙˆØ§Ù„ÙØ¦Ø© Ø¨Ø£Ø³Ø±Ø¹ ÙˆÙ‚Øª ÙÙŠ Ø§Ù„Ø´Ø§Øª.",
    image: "/scattergories.png",
    status: "testing",
    type: "puzzles",
    color: "blue",
  },
  {
    id: "categoryauction",
    name: "Ù…Ø²Ø§Ø¯ Ø§Ù„ÙØ¦Ø§Øª",
    description:
      "Ø±Ø§Ù‡Ù† Ø¹Ù„Ù‰ Ø¹Ø¯Ø¯ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø§Øª Ø§Ù„ØªÙŠ ÙŠÙ…ÙƒÙ†Ùƒ ØªØ°ÙƒØ±Ù‡Ø§ Ù„ÙØ¦Ø© Ù…Ø¹ÙŠÙ†Ø©... ÙˆØ£Ø«Ø¨Øª Ø°Ù„Ùƒ!",
    tutorial:
      "ÙŠØ¸Ù‡Ø± ØªØµÙ†ÙŠÙ Ù…Ø¹ÙŠÙ†ØŒ ÙˆØªÙƒØªØ¨ Ø±Ù‚Ù… Ø¨Ø§Ù„Ø´Ø§Øª Ù„Ù„Ù…Ø²Ø§ÙŠØ¯Ø©. Ø£Ø¹Ù„Ù‰ Ù…Ø²Ø§ÙŠØ¯ ÙŠÙƒØªØ¨ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø§Øª Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© Ù…Ø¨Ø§Ø´Ø±Ø© ÙÙŠ Ø§Ù„Ø´Ø§Øª (Ø¥Ø¬Ø§Ø¨Ø© ØªÙ„Ùˆ Ø§Ù„Ø£Ø®Ø±Ù‰ØŒ Ø£Ùˆ ÙƒÙ„Ù‡Ø§ ÙÙŠ Ø±Ø³Ø§Ù„Ø© ÙˆØ§Ø­Ø¯Ø©) Ù‚Ø¨Ù„ Ø§Ù†ØªÙ‡Ø§Ø¡ Ø§Ù„ÙˆÙ‚Øª.",
    image: "/categoryauction.png",
    status: "active",
    type: "strategy",
    color: "yellow",
    isNew: true,
  },
  {
    id: "trivialpursuit",
    name: "Ù…Ø³Ø§Ø± Ø§Ù„Ù…Ø¹Ø±ÙØ©",
    description:
      "Ù„Ø¹Ø¨Ø© Ù„ÙˆØ­ÙŠØ© Ù‡Ø§Ø¯Ø¦Ø© ÙˆØªÙ†Ø§ÙØ³ÙŠØ©! Ø§Ø±Ù…Ù Ø§Ù„Ù†Ø±Ø¯ ÙˆØ§Ø¬Ù…Ø¹ 4 Ù…ÙŠØ¯Ø§Ù„ÙŠØ§Øª Ù…Ù† Ø£Ø³Ø¦Ù„Ø© Ø«Ù‚Ø§ÙÙŠØ©.",
    tutorial:
      "Ø§ÙƒØªØ¨ !join Ù„Ù„ØªØ³Ø¬ÙŠÙ„ØŒ ÙˆØ¹Ù†Ø¯ Ø¯ÙˆØ±Ùƒ ØªÙƒØªØ¨ !roll Ù„Ù„Ø±Ù…ÙŠØŒ ÙˆØ¥Ø°Ø§ Ø¸Ù‡Ø± Ø³Ø¤Ø§Ù„ØŒ Ø§ÙƒØªØ¨ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© ÙÙŠ Ø§Ù„Ø´Ø§Øª Ù„ØªØ±Ø¨Ø­ Ù…ÙŠØ¯Ø§Ù„ÙŠØ©!",
    image: "/TrivialPursuit.png",
    status: "testing",
    type: "strategy",
    color: "blue",
  },
];
function MainApp() {
  const [channelNameInput, setChannelNameInput] = useState("");
  const [activeChannel, setActiveChannel] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [tutorialGame, setTutorialGame] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "coming_soon" | "testing"
  >("all");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "action" | "puzzles" | "strategy"
  >("all");
  const navigate = useNavigate();
  const location = useLocation();

  const { messages, isConnected, error } = useTwitchChat({
    channelName: activeChannel,
  });

  useEffect(() => {
    if (activeChannel) {
      window.scrollTo(0, 0);

      const onConnect = () => {
        socket.emit("streamer_online", activeChannel);
      };

      socket.on("connect", onConnect);

      if (socket.connected) {
        socket.emit("streamer_online", activeChannel);
      }

      return () => {
        socket.off("connect", onConnect);
      };
    }
  }, [activeChannel]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (channelNameInput.trim()) {
      const formattedChannel = channelNameInput.trim().toLowerCase();
      setActiveChannel(formattedChannel);
      socket.emit("streamer_online", formattedChannel);
      setShowUpdateModal(true);
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }, 50);
    }
  };

  const leaveGame = () => {
    setActiveGame(null);
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 50);
  };

  if (!activeChannel) {
    return (
      <div
        className="h-screen overflow-hidden flex flex-col flex flex-col items-center justify-center p-4 font-arabic relative overflow-hidden bg-brand-black"
        dir="rtl"
      >
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0 opacity-100"
        >
          <source src="/background.webm?v=1773683360769" type="video/webm" />
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-black z-0" />

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-indigo/10 rounded-2xl flex items-center justify-center border border-brand-indigo/30 shadow-[0_0_20px_rgba(0, 229, 255,0.2)]">
              <img
                src="/roz.png"
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-brand-pink tracking-wider glow-cyan-text">
              iRozQ8
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.twitch.tv/irozq8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#9146FF]/20 hover:bg-[#9146FF]/40 text-white px-4 py-2 rounded-xl border border-[#9146FF]/50 transition-all font-bold text-sm "
            >
              <Twitch className="w-4 h-4 text-[#9146FF]" />
              <span className="hidden sm:inline">
                Ù‚Ù†Ø§ØªÙŠ ÙÙŠ ØªÙˆÙŠØªØ´
              </span>
            </a>
            <a
              href="https://streamlabs.com/irozq8/tip"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm "
            >
              <Heart className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Ø¯Ø¹Ù… Ø§Ù„Ù‚Ù†Ø§Ø©</span>
            </a>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-brand-black/80  border border-brand-cyan/20 rounded-[40px] p-10 shadow-2xl z-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-cyan/50 to-transparent" />

          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-brand-cyan/5 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-brand-cyan/20 transform rotate-6 overflow-hidden shadow-2xl">
              <img
                src="/roz.png"
                alt="Roz Logo"
                className="w-full h-full object-fill -rotate-6 scale-[1.4]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.innerHTML =
                    '<div class="flex flex-col items-center text-brand-cyan/50"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg></div>';
                }}
              />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-3">
              Ù…Ù†ØµØ© Ø±ÙˆØ²
            </h1>
            <p className="text-brand-cyan/60 text-lg">
              Ø§Ø±Ø¨Ø· Ù‚Ù†Ø§ØªÙƒ Ù„Ù„Ø¨Ø¯Ø¡ Ø¨Ø§Ù„Ù„Ø¹Ø¨ Ù…Ø¹
              Ø§Ù„Ù…ØªØ§Ø¨Ø¹ÙŠÙ†
            </p>
          </div>

          <form onSubmit={handleConnect} className="space-y-8">
            <div>
              <label
                htmlFor="channel"
                className="block text-sm font-bold text-brand-cyan/50 mb-3 uppercase tracking-widest"
              >
                Ø§Ø³Ù… Ù‚Ù†Ø§Ø© ØªÙˆÙŠØªØ´
              </label>
              <div className="relative" dir="ltr">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <span className="text-brand-pink/30 font-mono text-sm">
                    twitch.tv/
                  </span>
                </div>
                <input
                  type="text"
                  id="channel"
                  value={channelNameInput}
                  onChange={(e) => setChannelNameInput(e.target.value)}
                  className="block w-full pl-32 pr-5 py-4 bg-white/5 border border-brand-cyan/20 rounded-2xl text-white placeholder-brand-cyan/20 focus:ring-2 focus:ring-brand-cyan/50 focus:border-transparent transition-all outline-none text-lg font-medium"
                  placeholder="username"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-cyan hover:bg-brand-pink text-brand-black font-black py-5 px-6 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_20px_rgba(0, 229, 255,0.2)] flex items-center justify-center gap-3 text-xl"
            >
              Ø§ØªØµØ§Ù„ ÙˆÙ„Ø¹Ø¨
            </button>
          </form>
        </motion.div>

        {/* Credits */}
        <div className="absolute bottom-6 left-0 right-0 text-center z-20 pointer-events-none">
          <p
            className="text-cyan-500/40 text-sm font-mono flex items-center justify-center gap-2"
            dir="ltr"
          >
            <span>Done by:</span>
            <span className="text-cyan-500/60 font-bold">iRozQ8</span>
            <span>â€¢</span>
            <span className="text-cyan-500/60 font-bold">iSari9</span>
            <span>â€¢</span>
            <span className="text-cyan-500/60 font-bold">iMythQ8</span>
          </p>
        </div>
      </div>
    );
  }

  // Full screen games
  if (activeGame === "bankrobbery") {
    return (
      <div
        className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center relative bg-brand-black font-arabic"
        dir="rtl"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0 opacity-100"
        >
          <source src="/background.webm?v=1773683360769" type="video/webm" />
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="relative z-10 w-full h-full">
          <BankRobberyGame onLeave={leaveGame} />
        </div>
      </div>
    );
  }

  if (activeGame === "trivia") {
    return (
      <div
        className="h-screen overflow-hidden flex flex-col text-white p-8 font-arabic flex flex-col items-center relative overflow-hidden bg-brand-black"
        dir="rtl"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0 opacity-100"
        >
          <source src="/background.webm?v=1773683360769" type="video/webm" />
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-black z-0" />

        {/* Top Bar */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-8 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-indigo/10 rounded-2xl flex items-center justify-center border border-brand-indigo/30 shadow-[0_0_20px_rgba(0, 229, 255,0.2)]">
              <img
                src="/roz.png"
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-brand-pink tracking-wider glow-cyan-text">
              iRozQ8
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.twitch.tv/irozq8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#9146FF]/20 hover:bg-[#9146FF]/40 text-white px-4 py-2 rounded-xl border border-[#9146FF]/50 transition-all font-bold text-sm "
            >
              <Twitch className="w-4 h-4 text-[#9146FF]" />
              <span className="hidden sm:inline">
                Ù‚Ù†Ø§ØªÙŠ ÙÙŠ ØªÙˆÙŠØªØ´
              </span>
            </a>
            <a
              href="https://streamlabs.com/irozq8/tip"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm "
            >
              <Heart className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Ø¯Ø¹Ù… Ø§Ù„Ù‚Ù†Ø§Ø©</span>
            </a>
          </div>
        </div>

        <div className="relative z-10 h-full w-full">
          <TriviaGame
            messages={messages}
            onLeave={leaveGame}
            channelName={activeChannel}
            isConnected={isConnected}
            error={error}
          />
        </div>
      </div>
    );
  }

  if (activeGame === "fruitwar") {
    return (
      <div
        className="h-screen overflow-hidden flex flex-col text-white p-8 font-arabic flex flex-col items-center relative overflow-hidden bg-brand-black"
        dir="rtl"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0 opacity-100"
        >
          <source src="/background.webm?v=1773683360769" type="video/webm" />
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-black z-0" />

        {/* Top Bar */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-8 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-indigo/10 rounded-2xl flex items-center justify-center border border-brand-indigo/30 shadow-[0_0_20px_rgba(0, 229, 255,0.2)]">
              <img
                src="/roz.png"
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-brand-pink tracking-wider glow-cyan-text">
              iRozQ8
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.twitch.tv/irozq8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#9146FF]/20 hover:bg-[#9146FF]/40 text-white px-4 py-2 rounded-xl border border-[#9146FF]/50 transition-all font-bold text-sm "
            >
              <Twitch className="w-4 h-4 text-[#9146FF]" />
              <span className="hidden sm:inline">
                Ù‚Ù†Ø§ØªÙŠ ÙÙŠ ØªÙˆÙŠØªØ´
              </span>
            </a>
            <a
              href="https://streamlabs.com/irozq8/tip"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm "
            >
              <Heart className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Ø¯Ø¹Ù… Ø§Ù„Ù‚Ù†Ø§Ø©</span>
            </a>
          </div>
        </div>

        <div className="relative z-10 h-full w-full">
          <FruitWar
            messages={messages}
            onLeave={leaveGame}
            channelName={activeChannel}
            isConnected={isConnected}
            error={error}
          />
        </div>
      </div>
    );
  }

  if (activeGame === "chairs") {
    return (
      <div
        className="h-screen overflow-hidden flex flex-col text-white p-8 font-arabic flex flex-col items-center relative overflow-hidden bg-brand-black"
        dir="rtl"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0 opacity-100"
        >
          <source src="/background.webm?v=1773683360769" type="video/webm" />
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-black z-0" />

        {/* Top Bar */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-8 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-indigo/10 rounded-2xl flex items-center justify-center border border-brand-indigo/30 shadow-[0_0_20px_rgba(0, 229, 255,0.2)]">
              <img
                src="/roz.png"
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-brand-pink tracking-wider glow-cyan-text">
              iRozQ8
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.twitch.tv/irozq8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#9146FF]/20 hover:bg-[#9146FF]/40 text-white px-4 py-2 rounded-xl border border-[#9146FF]/50 transition-all font-bold text-sm "
            >
              <Twitch className="w-4 h-4 text-[#9146FF]" />
              <span className="hidden sm:inline">
                Ù‚Ù†Ø§ØªÙŠ ÙÙŠ ØªÙˆÙŠØªØ´
              </span>
            </a>
            <a
              href="https://streamlabs.com/irozq8/tip"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm "
            >
              <Heart className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Ø¯Ø¹Ù… Ø§Ù„Ù‚Ù†Ø§Ø©</span>
            </a>
          </div>
        </div>

        <div className="relative z-10 h-full w-full">
          <ChairsGame
            messages={messages}
            onLeave={leaveGame}
            channelName={activeChannel}
            isConnected={isConnected}
            error={error}
          />
        </div>
      </div>
    );
  }

  if (activeGame === "roulette") {
    return (
      <div
        className="h-screen overflow-hidden flex flex-col text-white p-8 font-arabic flex flex-col items-center relative overflow-hidden bg-brand-black"
        dir="rtl"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0 opacity-100"
        >
          <source src="/background.webm?v=1773683360769" type="video/webm" />
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-black z-0" />

        {/* Top Bar */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-8 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-indigo/10 rounded-2xl flex items-center justify-center border border-brand-indigo/30 shadow-[0_0_20px_rgba(0, 229, 255,0.2)]">
              <img
                src="/roz.png"
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-brand-pink tracking-wider glow-cyan-text">
              iRozQ8
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.twitch.tv/irozq8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#9146FF]/20 hover:bg-[#9146FF]/40 text-white px-4 py-2 rounded-xl border border-[#9146FF]/50 transition-all font-bold text-sm "
            >
              <Twitch className="w-4 h-4 text-[#9146FF]" />
              <span className="hidden sm:inline">
                Ù‚Ù†Ø§ØªÙŠ ÙÙŠ ØªÙˆÙŠØªØ´
              </span>
            </a>
            <a
              href="https://streamlabs.com/irozq8/tip"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm "
            >
              <Heart className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Ø¯Ø¹Ù… Ø§Ù„Ù‚Ù†Ø§Ø©</span>
            </a>
          </div>
        </div>

        <div className="relative z-10 h-full w-full">
          <RouletteGame
            messages={messages}
            onLeave={leaveGame}
            channelName={activeChannel}
            isConnected={isConnected}
            error={error}
          />
        </div>
      </div>
    );
  }

  if (activeGame === "wordchain") {
    return (
      <div
        className="h-screen overflow-hidden flex flex-col text-white p-8 font-arabic flex flex-col items-center relative overflow-hidden bg-brand-black"
        dir="rtl"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0 opacity-100"
        >
          <source src="/background.webm?v=1773683360769" type="video/webm" />
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-black z-0" />

        {/* Top Bar */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-8 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-indigo/10 rounded-2xl flex items-center justify-center border border-brand-indigo/30 shadow-[0_0_20px_rgba(0, 229, 255,0.2)]">
              <img
                src="/roz.png"
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-brand-pink tracking-wider glow-cyan-text">
              iRozQ8
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.twitch.tv/irozq8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#9146FF]/20 hover:bg-[#9146FF]/40 text-white px-4 py-2 rounded-xl border border-[#9146FF]/50 transition-all font-bold text-sm "
            >
              <Twitch className="w-4 h-4 text-[#9146FF]" />
              <span className="hidden sm:inline">
                Ù‚Ù†Ø§ØªÙŠ ÙÙŠ ØªÙˆÙŠØªØ´
              </span>
            </a>
            <a
              href="https://streamlabs.com/irozq8/tip"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm "
            >
              <Heart className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Ø¯Ø¹Ù… Ø§Ù„Ù‚Ù†Ø§Ø©</span>
            </a>
          </div>
        </div>

        <div className="relative z-10 h-full w-full">
          <WordChainGame messages={messages} onLeave={leaveGame} />
        </div>
      </div>
    );
  }
  if (activeGame === "howmany") {
    return (
      <div
        className="h-screen overflow-hidden flex flex-col w-screen text-white font-arabic flex flex-col items-center relative overflow-hidden"
        dir="rtl"
      >
        <div className="relative z-10 h-full w-full flex-1">
          <HowManyGame
            onLeave={leaveGame}
            channelName={activeChannel}
            messages={messages}
          />
        </div>
      </div>
    );
  }
  if (activeGame === "teamfeud") {
    return (
      <div
        className="h-screen overflow-hidden flex flex-col text-white font-arabic flex flex-col items-center relative overflow-hidden"
        dir="rtl"
      >
        <div className="relative z-10 h-full w-full">
          <TeamFeudGame
            onLeave={leaveGame}
            messages={messages}
            channelName={activeChannel}
            isConnected={isConnected}
            error={error}
          />
        </div>
      </div>
    );
  }

  if (activeGame === "codenames") {
    return (
      <div
        className="h-screen overflow-hidden flex flex-col text-white font-arabic flex flex-col items-center relative overflow-hidden"
        dir="rtl"
      >
        <div className="relative z-10 h-full w-full">
          <CodeNamesGame
            onLeave={leaveGame}
            messages={messages}
            channelName={activeChannel}
            isConnected={isConnected}
            error={error}
          />
        </div>
      </div>
    );
  }
  if (activeGame === "guessmusic") {
    return <MusicGuesserGame onLeave={leaveGame} />;
  }

  if (activeGame === "priceisright") {
    return (
      <div
        className="h-screen overflow-hidden flex flex-col text-white p-8 font-arabic flex flex-col items-center relative overflow-hidden bg-brand-black"
        dir="rtl"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0 opacity-100"
        >
          <source src="/background.webm?v=1773683360769" type="video/webm" />
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-black z-0" />

        {/* Top Bar */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-8 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-indigo/10 rounded-2xl flex items-center justify-center border border-brand-indigo/30 shadow-[0_0_20px_rgba(0, 229, 255,0.2)]">
              <img
                src="/roz.png"
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-brand-pink tracking-wider glow-cyan-text">
              iRozQ8
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.twitch.tv/irozq8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#9146FF]/20 hover:bg-[#9146FF]/40 text-white px-4 py-2 rounded-xl border border-[#9146FF]/50 transition-all font-bold text-sm "
            >
              <Twitch className="w-4 h-4 text-[#9146FF]" />
              <span className="hidden sm:inline">
                Ù‚Ù†Ø§ØªÙŠ ÙÙŠ ØªÙˆÙŠØªØ´
              </span>
            </a>
            <a
              href="https://streamlabs.com/irozq8/tip"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm "
            >
              <Heart className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Ø¯Ø¹Ù… Ø§Ù„Ù‚Ù†Ø§Ø©</span>
            </a>
          </div>
        </div>

        <div className="relative z-10 h-full w-full">
          <PriceIsRightGame messages={messages} onLeave={leaveGame} />
        </div>
      </div>
    );
  } // Removed RussianRouletteGame support

  if (activeGame === "snakes") {
    return (
      <SnakesAndLaddersGame
        messages={messages}
        onLeave={leaveGame}
        channelName={activeChannel}
        isConnected={isConnected}
        error={error}
      />
    );
  }

  if (activeGame === "typingderby") {
    return (
      <TypingDerbyGame
        messages={messages}
        onLeave={leaveGame}
        channelName={activeChannel}
        isConnected={isConnected}
        error={error}
      />
    );
  }

  if (activeGame === "typingroyale") {
    return (
      <TypingRoyaleGame
        messages={messages}
        onLeave={leaveGame}
        channelName={activeChannel}
        isConnected={isConnected}
        error={error}
      />
    );
  }

  if (activeGame === "missinglink") {
    return (
      <MissingLinkGame
        messages={messages}
        onLeave={leaveGame}
        channelName={activeChannel}
      />
    );
  }

  if (activeGame === "scattergories") {
    return (
      <ScattergoriesGame
        messages={messages}
        onLeave={leaveGame}
        channelName={activeChannel}
      />
    );
  }

  if (activeGame === "categoryauction") {
    return (
      <CategoryAuctionGame
        messages={messages}
        onLeave={leaveGame}
        channelName={activeChannel}
      />
    );
  }

  if (activeGame === "trivialpursuit") {
    return (
      <div
        className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center relative bg-brand-black font-arabic"
        dir="rtl"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0 opacity-100"
        >
          <source src="/background.webm?v=1773683360769" type="video/webm" />
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="relative z-10 w-full h-full">
          <TrivialPursuitGame
            messages={messages}
            onLeave={leaveGame}
            channelName={activeChannel}
          />
        </div>
      </div>
    );
  }

  if (activeGame === "hotpotato") {
    return (
      <HotPotatoGame
        messages={messages}
        onLeave={leaveGame}
        channelName={activeChannel}
        isConnected={isConnected}
        error={error}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-brand-black text-white font-sans flex flex-col relative overflow-hidden"
      dir="rtl"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src="/background.webm?v=1773683360769" type="video/webm" />
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-brand-black/20 z-0" />

      {/* Top Bar */}
      <div className="w-full max-w-[96vw] flex items-center justify-between mb-4 relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-brand-indigo/10 rounded-2xl flex items-center justify-center border border-brand-indigo/30 shadow-[0_0_20px_rgba(0, 229, 255,0.2)]">
            <img
              src="/roz.png"
              alt="Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-brand-pink tracking-wider glow-cyan-text">
            iRozQ8
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://www.twitch.tv/irozq8"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#9146FF]/20 hover:bg-[#9146FF]/40 text-white px-4 py-2 rounded-xl border border-[#9146FF]/50 transition-all font-bold text-sm "
          >
            <Twitch className="w-4 h-4 text-[#9146FF]" />
            <span className="hidden sm:inline">Ù‚Ù†Ø§ØªÙŠ ÙÙŠ ØªÙˆÙŠØªØ´</span>
          </a>
          <a
            href="https://streamlabs.com/irozq8/tip"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm "
          >
            <Heart className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Ø¯Ø¹Ù… Ø§Ù„Ù‚Ù†Ø§Ø©</span>
          </a>
        </div>
      </div>

      <div className="w-full max-w-[96vw] flex gap-8 h-[75vh] relative z-10 pb-8 flex-1 min-h-0">
        {/* Main Content Area */}
        <div className="flex-1 bg-brand-black/80  rounded-[40px] border border-brand-cyan/20 p-8 flex flex-col relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 to-transparent" />

          <div className="relative z-10 w-full h-full flex flex-col">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-black text-white tracking-tight">
                    Ø±Ø¯Ù‡Ø© Ø§Ù„Ø£Ù„Ø¹Ø§Ø¨
                  </h1>
                  <p className="text-brand-cyan/60 mt-1 text-lg">
                    Ø§Ø®ØªØ± Ù„Ø¹Ø¨Ø© Ù„Ù„Ø¹Ø¨Ù‡Ø§ Ù…Ø¹ Ø§Ù„Ø¯Ø±Ø¯Ø´Ø©
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => setActiveChannel("")}
                    className="text-brand-cyan/70 hover:text-brand-cyan transition-all text-sm font-bold flex items-center gap-2 bg-brand-cyan/5 px-5 py-2.5 rounded-xl border border-brand-cyan/20 hover:border-brand-cyan/40"
                  >
                    <ArrowLeft className="w-4 h-4 rotate-180" /> Ù‚Ø·Ø¹
                    Ø§Ù„Ø§ØªØµØ§Ù„
                  </button>

                  {/* Filters */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-brand-black/70 p-1.5 rounded-2xl border border-brand-cyan/10">
                      <button
                        onClick={() => setStatusFilter("all")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === "all" ? "bg-brand-cyan text-brand-black shadow-lg" : "text-brand-cyan/40 hover:text-brand-cyan/70"}`}
                      >
                        Ø§Ù„ÙƒÙ„
                      </button>
                      <button
                        onClick={() => setStatusFilter("active")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === "active" ? "bg-brand-cyan text-brand-black shadow-lg" : "text-brand-cyan/40 hover:text-brand-cyan/70"}`}
                      >
                        Ù†Ø´Ø·Ø©
                      </button>
                      <button
                        onClick={() => setStatusFilter("coming_soon")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === "coming_soon" ? "bg-brand-cyan text-brand-black shadow-lg" : "text-brand-cyan/40 hover:text-brand-cyan/70"}`}
                      >
                        Ù‚Ø±ÙŠØ¨Ø§Ù‹
                      </button>
                      <button
                        onClick={() => setStatusFilter("testing")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === "testing" ? "bg-brand-cyan text-brand-black shadow-lg" : "text-brand-cyan/40 hover:text-brand-cyan/70"}`}
                      >
                        ØªØ¬Ø±ÙŠØ¨ÙŠ
                      </button>
                    </div>

                    <div className="flex items-center gap-2 bg-brand-black/70 p-1.5 rounded-2xl border border-brand-cyan/10">
                      <button
                        onClick={() => setTypeFilter("all")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${typeFilter === "all" ? "bg-brand-cyan text-brand-black shadow-lg" : "text-brand-cyan/40 hover:text-brand-cyan/70"}`}
                      >
                        Ø§Ù„ÙƒÙ„
                      </button>
                      <button
                        onClick={() => setTypeFilter("action")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${typeFilter === "action" ? "bg-brand-cyan text-brand-black shadow-lg" : "text-brand-cyan/40 hover:text-brand-cyan/70"}`}
                      >
                        Ø£ÙƒØ´Ù†
                      </button>
                      <button
                        onClick={() => setTypeFilter("puzzles")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${typeFilter === "puzzles" ? "bg-brand-cyan text-brand-black shadow-lg" : "text-brand-cyan/40 hover:text-brand-cyan/70"}`}
                      >
                        Ø£Ù„ØºØ§Ø²
                      </button>
                      <button
                        onClick={() => setTypeFilter("strategy")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${typeFilter === "strategy" ? "bg-brand-cyan text-brand-black shadow-lg" : "text-brand-cyan/40 hover:text-brand-cyan/70"}`}
                      >
                        Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ©
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 mt-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                  {GAMES.filter((game) => {
                    const matchesStatus =
                      statusFilter === "all" || game.status === statusFilter;
                    const matchesType =
                      typeFilter === "all" || game.type === typeFilter;
                    return matchesStatus && matchesType;
                  })
                    .sort((a, b) => {
                      const statusOrder: Record<string, number> = {
                        active: 1,
                        testing: 2,
                        coming_soon: 3,
                      };
                      // If statuses are equal, maintain original order (stability not guaranteed but good enough)
                      // Or we could sort by name as a secondary sort
                      return (
                        (statusOrder[a.status] || 99) -
                        (statusOrder[b.status] || 99)
                      );
                    })
                    .map((game) => (
                      <div
                        key={game.id}
                        onClick={() => {
                          if (
                            game.status === "active" ||
                            game.status === "testing"
                          )
                            setActiveGame(game.id);
                        }}
                        className={`group relative bg-brand-black/70  border-2 border-brand-indigo/40 hover:border-brand-pink/60 p-7 rounded-[34px] text-right transition-all duration-500 flex flex-col h-full shadow-xl hover:shadow-brand-cyan/10 hover:-translate-y-2 cursor-pointer ${game.status === "coming_soon" ? "opacity-100 grayscale cursor-not-allowed" : ""}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[30px]" />

                        <div className="w-full h-56 mb-6 rounded-2xl overflow-hidden shrink-0 border border-brand-pink/20 bg-brand-black/70 flex items-center justify-center relative shadow-inner">
                          <img
                            src={game.image}
                            alt={game.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                              (
                                e.target as HTMLImageElement
                              ).parentElement!.innerHTML =
                                `<div class="flex flex-col items-center text-brand-pink/30"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 21l-5-5 5-5 5 5-5 5z"></path><path d="M2 21h20"></path></svg></div>`;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 to-transparent opacity-60" />

                          {game.isNew && (
                            <div className="absolute top-4 right-4 bg-brand-pink text-brand-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                              Ø¬Ø¯ÙŠØ¯
                            </div>
                          )}
                          {game.status === "coming_soon" && (
                            <div className="absolute top-4 right-4 bg-brand-black/80 text-brand-pink/50 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-brand-pink/20">
                              Ù‚Ø±ÙŠØ¨Ø§Ù‹
                            </div>
                          )}
                          {game.status === "testing" && (
                            <div className="absolute top-4 right-4 bg-brand-pink/20 text-brand-pink text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg border border-brand-pink/30">
                              ØªØ¬Ø±ÙŠØ¨ÙŠ
                            </div>
                          )}
                        </div>

                        <div className="relative z-10">
                          <h3 className="text-3xl font-black text-white mb-3 tracking-tight group-hover:text-brand-pink transition-colors">
                            {game.name}
                          </h3>
                          <p className="text-brand-pink/80 text-base leading-relaxed flex-1 font-medium">
                            {game.description}
                          </p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-brand-pink/10 flex items-center justify-between">
                          <span className="text-[10px] font-black text-brand-pink/40 uppercase tracking-widest">
                            {game.type}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTutorialGame(game.id);
                              }}
                              className="w-8 h-8 rounded-full bg-brand-pink/10 flex items-center justify-center hover:bg-brand-pink hover:text-brand-black transition-all text-brand-pink"
                              title="ÙƒÙŠÙ ØªÙ„Ø¹Ø¨ØŸ"
                            >
                              <HelpCircle className="w-4 h-4" />
                            </button>
                            <div className="w-8 h-8 rounded-full bg-brand-pink/10 flex items-center justify-center group-hover:bg-brand-pink group-hover:text-brand-black transition-all text-brand-pink">
                              <Rocket className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Sidebar Chat */}
        <div className="w-[500px] flex flex-col gap-4">
          <div className="flex-1 min-h-0 bg-brand-black/80  rounded-[40px] border border-brand-cyan/20 overflow-hidden shadow-2xl">
            <TwitchChat
              channelName={activeChannel}
              messages={messages}
              isConnected={isConnected}
              error={error}
            />
          </div>
        </div>
      </div>

      {/* Update Modal */}
      <AnimatePresence>
        {showUpdateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-brand-black/90 border border-brand-indigo/30 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowUpdateModal(false)}
                className="absolute top-4 left-4 text-brand-cyan/50 hover:text-brand-cyan transition-colors"
              >
                <ArrowLeft className="w-6 h-6 rotate-180" />
              </button>

              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-brand-indigo/10 rounded-full flex items-center justify-center border border-brand-indigo/30">
                  <Sparkles className="w-8 h-8 text-brand-cyan" />
                </div>
              </div>

              <h2 className="text-3xl font-black text-white text-center mb-2 tracking-tight">
                ØªØ­Ø¯ÙŠØ« <span className="text-brand-pink">Ø¬Ø¯ÙŠØ¯!</span>
              </h2>
              <div className="flex justify-center mb-2">
                <span className="bg-brand-pink/20 text-brand-cyan px-3 py-1 rounded-full text-xs font-bold font-mono text-center">
                  17/3/2026
                </span>
              </div>
              <p className="text-brand-cyan/60 flex items-center justify-center gap-2 mb-6 text-sm">
                ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø£Ù„Ø¹Ø§Ø¨ ÙˆØ¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ø²ÙŠØ¯
              </p>

              <div className="space-y-4 mb-8 text-right bg-white/5 p-5 rounded-2xl border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-500/20 p-2 rounded-lg mt-1 shrink-0">
                    <Banknote className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">
                      Ø´Ø±Ø·ÙŠ Ø­Ø±Ø§Ù…ÙŠ
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Ù„Ø¹Ø¨Ø© Ø®Ø¯Ø§Ø¹ ÙˆØªØµÙˆÙŠØª! ÙƒÙˆÙ†ÙˆØ§ ÙØ±ÙŠÙ‚Ø§Ù‹
                      Ù„Ø³Ø±Ù‚Ø© Ø§Ù„Ø¨Ù†ÙƒØŒ Ù„ÙƒÙ† Ø§Ø­Ø°Ø±ÙˆØ§ Ù…Ù†
                      Ø§Ù„Ø´Ø±Ø·Ø© Ø§Ù„Ù…ØªØ®ÙÙŠÙ† Ø¨ÙŠÙ†ÙƒÙ….
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-red-500/20 p-2 rounded-lg mt-1 shrink-0">
                    <Bomb className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">
                      Ø§Ù„Ø¨Ø·Ø§Ø·Ø§ Ø§Ù„Ø³Ø§Ø®Ù†Ø©
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Ù„Ø¹Ø¨Ø© Ø§Ù„Ø³Ø±Ø¹Ø© ÙˆØ§Ù„Ø£Ø³Ø¦Ù„Ø©! Ø£Ø¬Ø¨ Ø¨Ø³Ø±Ø¹Ø©
                      Ù„ØªÙ…Ø±ÙŠØ± Ø§Ù„Ù‚Ù†Ø¨Ù„Ø© Ø§Ù„Ù…ÙˆÙ‚ÙˆØªØ© Ù‚Ø¨Ù„ Ø£Ù†
                      ØªÙ†Ù‚Ø¶ÙŠ Ù¢Ù  Ø«Ø§Ù†ÙŠØ©!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg mt-1 shrink-0">
                    <Tag className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">
                      Ù…Ø³Ø§Ø± Ø§Ù„Ù…Ø¹Ø±ÙØ©
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Ù„Ø¹Ø¨Ø© Ù„ÙˆØ­ÙŠØ© Ù‡Ø§Ø¯Ø¦Ø© ÙˆØªÙ†Ø§ÙØ³ÙŠØ©! Ø§Ø±Ù…Ù
                      Ø§Ù„Ù†Ø±Ø¯ ÙˆØ§Ø¬Ù…Ø¹ 4 Ù…ÙŠØ¯Ø§Ù„ÙŠØ§Øª Ù…Ù† Ø£Ø³Ø¦Ù„Ø©
                      Ø«Ù‚Ø§ÙÙŠØ©.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-red-500/20 p-2 rounded-lg mt-1 shrink-0">
                    <Crown className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Ø­Ø±Ù ÙˆÙØ¦Ø©</h3>
                    <p className="text-sm text-zinc-400">
                      Ø£Ø³Ø±Ø¹ Ø¨Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø¨ÙƒÙ„Ù…Ø© ØªØ¨Ø¯Ø£ Ø¨Ø§Ù„Ø­Ø±Ù
                      Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ ÙˆØªØ·Ø§Ø¨Ù‚ Ø§Ù„ÙØ¦Ø©!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 mb-8 bg-brand-cyan/5 border border-brand-cyan/10 p-4 rounded-xl">
                <Info className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                <p className="text-xs text-brand-cyan/80 leading-relaxed text-right">
                  Ù‡Ø°Ù‡ Ø§Ù„Ø£Ù„Ø¹Ø§Ø¨ Ø­Ø§Ù„ÙŠØ§Ù‹ ÙÙŠ{" "}
                  <span className="font-bold text-brand-pink">
                    ÙˆØ¶Ø¹ ØªØ¬Ø±ÙŠØ¨ÙŠ
                  </span>{" "}
                  ÙˆÙ‚Ø¯ ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø£Ø®Ø·Ø§Ø¡. ÙÙŠ Ø­Ø§Ù„ ÙˆØ§Ø¬Ù‡Øª
                  Ø£ÙŠ Ù…Ø´ÙƒÙ„Ø©ØŒ ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§ Ø¹Ø¨Ø±
                  Ø§Ù„Ø¥ÙŠÙ…ÙŠÙ„{" "}
                  <a
                    href="mailto:M@irozq8.com"
                    className="text-white hover:underline transition-colors hover:text-brand-cyan"
                    dir="ltr"
                  >
                    M@irozq8.com
                  </a>
                  .
                </p>
              </div>

              <button
                onClick={() => setShowUpdateModal(false)}
                className="w-full bg-brand-cyan hover:bg-brand-pink text-brand-black font-black py-4 rounded-xl transition-all shadow-lg text-lg"
              >
                Ø­Ø³Ù†Ø§Ù‹ØŒ ÙÙ„Ù†Ù„Ø¹Ø¨!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Credits */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-20 pointer-events-none">
        <p
          className="text-brand-pink/40 text-sm font-mono flex items-center justify-center gap-2"
          dir="ltr"
        >
          <span>ØªÙ… Ø§Ù„ØªØ·ÙˆÙŠØ± Ø¨ÙˆØ§Ø³Ø·Ø©:</span>
          <span className="text-brand-pink/60 font-bold">iRozQ8</span>
          <span>â€¢</span>
          <span className="text-brand-pink/60 font-bold">iSari9</span>
          <span>â€¢</span>
          <span className="text-brand-pink/60 font-bold">iMythQ8</span>
          <span className="text-brand-pink/40 text-xs ml-2">(v1.1)</span>
        </p>
        <p className="text-brand-cyan/40 text-xs mt-1 pointer-events-auto">
          Ø§Ù„Ø¯Ø¹Ù… Ø§Ù„ÙÙ†ÙŠ:{" "}
          <a
            href="mailto:M@irozq8.com"
            className="hover:text-brand-cyan transition-colors"
          >
            M@irozq8.com
          </a>
        </p>
      </div>
    </div>
  );
}
