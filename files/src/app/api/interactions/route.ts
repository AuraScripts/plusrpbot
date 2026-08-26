import { NextRequest, NextResponse } from "next/server";
import nacl from "tweetnacl";

// Helper to verify Discord signature
function verifyDiscordRequest(
  publicKey: string,
  signature: string,
  timestamp: string,
  body: string
): boolean {
  try {
    return nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, "hex"),
      Buffer.from(publicKey, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const body = await request.text();

  const publicKey = process.env.DISCORD_PUBLIC_KEY;

  if (!signature || !timestamp || !publicKey) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const isValid = verifyDiscordRequest(publicKey, signature, timestamp, body);

  if (!isValid) {
    return new NextResponse("Invalid request signature", { status: 401 });
  }

  const interaction = JSON.parse(body);

  // Discord PING (required for endpoint validation)
  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // Slash command: /verify
  if (interaction.type === 2 && interaction.data?.name === "verify") {
    return NextResponse.json({
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        embeds: [
          {
            title: "Paskyros patvirtinimas",
            description:
              "Patvirtinkite savo Discord paskyrą autorizuodami programėlę. Patvirtinus jums bus suteikta naudotojo rolė.",
            color: 0x5865f2,
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 1, // Primary (blue)
                label: "Patvirtinti paskyrą",
                custom_id: "verify_button",
              },
            ],
          },
        ],
      },
    });
  }

  // Button click: "Patvirtinti paskyrą"
  if (interaction.type === 3 && interaction.data?.custom_id === "verify_button") {
    const authUrl = `${process.env.NEXTAUTH_URL}/api/auth/login`;

    return NextResponse.json({
      type: 4,
      data: {
        content:
          "Paspauskite mygtuką ir užbaikite autorizaciją per 10 minučių. Nuoroda susieta tik su jūsų Discord paskyra.",
        flags: 64, // Ephemeral (only the user sees it)
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 5, // Link button
                label: "Autorizuoti Discord programėlę",
                url: authUrl,
              },
            ],
          },
        ],
      },
    });
  }

  return NextResponse.json({ error: "Unknown interaction" }, { status: 400 });
}
