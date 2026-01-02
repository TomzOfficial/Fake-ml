import express from "express";
import { createCanvas, loadImage } from "canvas";
import axios from "axios";
import path from "path";

const app = express();
const PORT = 3000;
const ASSET = path.join(process.cwd(), "assets");

/* =========================
   RANK INPUT (EN + JP)
========================= */
const RANK_ALIAS = {
  "warrior": "warrior",
  "戦士": "warrior",

  "elite": "elite",
  "エリート": "elite",

  "master": "master",
  "マスター": "master",

  "grandmaster": "grandmaster",
  "グランドマスター": "grandmaster",

  "epic": "epic",
  "すごい": "epic",

  "legend": "legend",
  "伝説": "legend",

  "mythic": "mythic",
  "神話": "mythic",

  "mythic honor": "honor",
  "神話的な名誉": "honor",

  "mythic glory": "glory",
  "神話の栄光": "glory",

  "mythic immortal": "immortal",
  "神話上の不滅者": "immortal"
};

/* =========================
   RANK → ICON FILE
========================= */
const RANK_ICON = {
  warrior: "warrior.png",
  elite: "elite.png",
  master: "master.png",
  grandmaster: "grandmaster.png",
  epic: "epic.png",
  legend: "legend.png",
  mythic: "mythic.png",
  honor: "mythic_honor.png",
  glory: "mythic_glory.png",
  immortal: "mythic_immortal.png"
};

/* =========================
   RANK → JAPANESE TEXT
========================= */
const RANK_JP = {
  warrior: "戦士",
  elite: "エリート",
  master: "マスター",
  grandmaster: "グランドマスター",
  epic: "すごい",
  legend: "伝説",
  mythic: "神話",
  honor: "神話的な名誉",
  glory: "神話の栄光",
  immortal: "神話上の不滅者"
};

/* =========================
   UTILS
========================= */
function clean(text = "") {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeRank(input) {
  if (!input) return null;
  return RANK_ALIAS[clean(input)] || null;
}

/* =========================
   API
========================= */
app.get("/canvas/fakeml", async (req, res) => {
  try {
    const avatarUrl = req.query.avatar;
    const nickname = req.query.nickname || "NoName";

    const rawRank = req.query.rank;
    const rankKey = normalizeRank(rawRank);
    const hasRank = Boolean(rankKey);

    /**
     * LOGIC FINAL (ANTI DOBEL)
     * - ADA rank  -> pakai template_polos (gambar rank dinamis)
     * - TIDAK ADA -> pakai template_rank (rank bawaan)
     */
    const template = hasRank
      ? "template_polos.png"
      : "template_rank.png";

    const canvas = createCanvas(1080, 1920);
    const ctx = canvas.getContext("2d");

    // BACKGROUND
    const bg = await loadImage(path.join(ASSET, template));
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // AVATAR
    if (avatarUrl) {
      const avatarBuf = await axios.get(avatarUrl, {
        responseType: "arraybuffer"
      });
      const avatar = await loadImage(avatarBuf.data);

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(420, 330, 240, 240, 24);
      ctx.clip();
      ctx.drawImage(avatar, 420, 330, 240, 240);
      ctx.restore();
    }

    // NICKNAME
    ctx.fillStyle = "#4cff4c";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(nickname, 540, 310);

    // RANK DINAMIS (HANYA JIKA ADA RANK)
    if (hasRank) {
      const iconFile = RANK_ICON[rankKey];
      const jpText = RANK_JP[rankKey];

      if (iconFile) {
        const icon = await loadImage(
          path.join(ASSET, "ranks", iconFile)
        );
        ctx.drawImage(icon, 420, 620, 240, 240);
      }

      if (jpText) {
        ctx.fillStyle = "#ffd966";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "center";
        ctx.fillText(jpText, 540, 900);
      }
    }

    res.set("Content-Type", "image/png");
    res.send(canvas.toBuffer("image/png"));
  } catch (err) {
    console.error(err);
    res.status(500).send("Canvas Error");
  }
});

app.listen(PORT, () => {
  console.log(`API jalan → http://localhost:${PORT}`);
});