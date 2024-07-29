// pages/api/ussd.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from "next/server";

// Simulated session store (for development purposes)
const sessionStore: { [key: string]: { userData: string, currentWordIndex: number } } = {};

// Scrambled words data
const scrambledWords = [
  { word: "ASNAT LACSU", hint: "Unscramble to form a mythical person (often related to a holiday).", answer: "SANTA CLAUS" },
  { word: "AEPLPE", hint: "Unscramble to form a fruit (often red or green).", answer: "APPLE" },
  { word: "TELFRISEBTU", hint: "Unscramble to form a type of beautiful insect (often seen during Spring).", answer: "BUTTERFLY" },
  { word: "CEI RAMEC", hint: "Unscramble to form a type of snack (often kept frozen).", answer: "ICE CREAM" },
  { word: "LOREFSW", hint: "Unscramble to form an object part of nature (often used to show love or appreciation).", answer: "FLOWERS" }
];

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return new NextResponse(JSON.stringify({ message: "Method Not Allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const contentType = req.headers.get("content-type");
    if (contentType !== "application/x-www-form-urlencoded") {
      return new NextResponse(
        JSON.stringify({ message: "Unsupported Media Type" }),
        {
          status: 415,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Parse the URL-encoded request body
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const ussd_id = data['USERID'];
    const msisdn = data['MSISDN'];
    const user_data = data['USERDATA'];
    const msgtype = data['MSGTYPE'];
    const sessionId = msisdn;  // Using msisdn as the session identifier

    let response = "";

    // Initialize or retrieve session data
    if (!sessionStore[sessionId]) {
      sessionStore[sessionId] = { userData: "", currentWordIndex: 0 };
    }

    // Handle different text inputs
    if (user_data === "") {
      response = "CON Hi, welcome. Your mental health is a priority. Don't be afraid to seek help.\n1. Suicide and Crisis\n2. Telephone Counselling\n3. Play a Game";
    } else if (user_data === "1") {
      response = "CON Suicide and Crisis Hotlines:\n1. Ambulance\n2. Emergency number\n3. Suicide Hotline\n4. Fire Service\n5. Police\n0. Back";
    } else if (user_data === "1*1") {
      response = "END Please dial 193 for Ambulance services.";
    } else if (user_data === "1*2") {
      response = "END Please dial 999 for Emergency services.";
    } else if (user_data === "1*3") {
      response = "END Please dial +233 24 447 1279 for Suicide Hotline.";
    } else if (user_data === "1*4") {
      response = "END Please dial 192 for Fire Service.";
    } else if (user_data === "1*5") {
      response = "END Please dial 191 for Police.";
    } else if (user_data === "2") {
      response = "CON Telephone Counselling Hotlines:\n1. Greater Accra Region\n2. Ashanti Region\n3. Western Region\n4. Brong Ahafo Region\n5. Northern Region\n0. Back";
    } else if (user_data === "2*1") {
      response = "END Please dial 030 266 2441 for Greater Accra Region.";
    } else if (user_data === "2*2") {
      response = "END Please dial 032 202 2323 for Ashanti Region.";
    } else if (user_data === "2*3") {
      response = "END Please dial 031 204 6121 for Western Region.";
    } else if (user_data === "2*4") {
      response = "END Please dial 035 202 7083 for Brong Ahafo Region.";
    } else if (user_data === "2*5") {
      response = "END Please dial 037 202 2889 for Northern Region.";
    } else if (user_data === "3") {
      response = "CON Games:\n1. Word Scramble\n2. Free Web Games\n3. Free Web Comics/Stories\n0. Back";
    } else if (user_data === "3*1") {
      const userGame = sessionStore[sessionId];
      const currentWord = scrambledWords[userGame.currentWordIndex];

      if (currentWord) {
        response = `CON Word Scramble:\nHint: ${currentWord.hint}\nScrambled Word: ${currentWord.word}`;
      } else {
        response = "END No more words to scramble.";
      }
    } else if (user_data.startsWith("3*1*")) {
      const userGame = sessionStore[sessionId];
      const currentWord = scrambledWords[userGame.currentWordIndex];
      const answer = user_data.split("*").pop() || ""; // Extract the user's answer from the last part of the text array

      if (answer.toUpperCase() === currentWord.answer.toUpperCase()) {
        userGame.currentWordIndex += 1;

        if (userGame.currentWordIndex < scrambledWords.length) {
          const nextWord = scrambledWords[userGame.currentWordIndex];
          response = `CON Correct! Next word:\nHint: ${nextWord.hint}\nScrambled Word: ${nextWord.word}`;
        } else {
          response = "END You've completed all the words!";
        }
      } else {
        response = `CON Incorrect. Try again:\nHint: ${currentWord.hint}\nScrambled Word: ${currentWord.word}`;
      }
    } else if (user_data === "3*2") {
      response = "END Visit the following URLs for free web games:\n1. https://www.miniclip.com\n2. https://www.kongregate.com\n3. https://www.crazygames.com";
    } else if (user_data === "3*3") {
      response = "END Visit the following URLs for free web comics/stories:\n1. https://www.webtoons.com\n2. https://www.tapas.io\n3. https://www.shortstories.com";
    } else if (user_data === "0") {
      response = "CON Hi, welcome. Your mental health is a priority. Don't be afraid to seek help.\n1. Suicide and Crisis\n2. Telephone Counselling\n3. Play a Game";
    } else {
      response = "END Invalid Choice.";
    }

    return new NextResponse(response, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse(JSON.stringify({ message: "Invalid form data" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
