const sourceDbPath = "/home/franz/.thunderbird/gtyy2h3f.default-release/history.sqlite";

// Copy the database to a temporary folder to avoid locking issues with the live Thunderbird process
const tempDir = await Deno.makeTempDir();
const dbPath = `${tempDir}/history.sqlite`;
await Deno.copyFile(sourceDbPath, dbPath);


async function listAllEntries() {

  const sqlQuery = `
SELECT 
    json_group_array(
        json_object(
            'PrimaryEmail', PrimaryEmail,
            'DisplayName', DisplayName
        )
    )
FROM (
    SELECT 
        MAX(CASE WHEN name = 'PrimaryEmail' THEN value ELSE '' END) AS PrimaryEmail,
        MAX(CASE WHEN name = 'DisplayName' THEN value ELSE '' END) AS DisplayName
    FROM properties 
    GROUP BY card
);
`;

  const command = new Deno.Command("sqlite3", {
    args: [
      dbPath,
      sqlQuery,
    ],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await command.output();

  if (code === 0) {
    const output = new TextDecoder().decode(stdout);
    console.log(output);
  } else {
    const error = new TextDecoder().decode(stderr);
    console.error(`Error: ${error}`);
  }

}

async function lookupContact(inputName) {

  const normalizedInput = inputName.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  const parts = normalizedInput.split(" ");
  const swappedInput = parts.length > 1 ? `${parts[1]} ${parts[0]}` : normalizedInput;

  // Changed '=' to 'LIKE' and added '%' wildcards
  const sqlQuery = `
    SELECT json_group_array(json_object('name', name, 'value', value))
    FROM properties
    WHERE card = (
      SELECT card FROM properties 
      WHERE name = 'DisplayName' 
      AND (
        REPLACE(REPLACE(value, ',', ' '), '  ', ' ') LIKE '%${normalizedInput}%'
        OR 
        REPLACE(REPLACE(value, ',', ' '), '  ', ' ') LIKE '%${swappedInput}%'
      )
      LIMIT 1
    );
  `;

  const command = new Deno.Command("sqlite3", {
    args: [dbPath, sqlQuery],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await command.output();

 if (code === 0) {
    const rawOutput = new TextDecoder().decode(stdout).trim();
    if (!rawOutput || rawOutput === "[]") {
      console.log("");
      return;
    }

    // Parse the EAV array: [{name: "PrimaryEmail", value: "..."}, ...]
    const eavArray = JSON.parse(rawOutput);

    // Merge into a single Key:Value object
    const mergedContact = Object.fromEntries(
      eavArray.map(item => [item.name, item.value])
    );

    // 1. Show the whole merged output
    console.log("--- Merged Contact Object ---");
    console.log(JSON.stringify(mergedContact, null, 2));

    // 2. Separate output with just the email
    console.log("\n--- Primary Email ---");
    console.log(mergedContact.PrimaryEmail || "Not found");

  } else {
    const error = new TextDecoder().decode(stderr);
    console.error(`Error: ${error}`);
  }
}

async function lookupEmailsByDomain(domainName) {
  const sqlQuery = `
    SELECT json_group_array(value)
    FROM properties
    WHERE name = 'PrimaryEmail' AND value LIKE '%@${domainName}';
  `;

  const command = new Deno.Command("sqlite3", {
    args: [dbPath, sqlQuery],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await command.output();

  if (code === 0) {
    const rawOutput = new TextDecoder().decode(stdout).trim();
    const emails = JSON.parse(rawOutput || "[]");
    console.log(`--- Emails for domain: ${domainName} ---`);
    console.log(JSON.stringify(emails, null, 2));
    return emails;
  } else {
    const error = new TextDecoder().decode(stderr);
    console.error(`Error: ${error}`);
  }
}

lookupEmailsByDomain("hays.de")