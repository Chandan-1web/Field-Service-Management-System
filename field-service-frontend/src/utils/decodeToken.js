export function decodeToken(token) {
  try {
    const payload = token.split(".")[1];

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");

    const decodedPayload = decodeURIComponent(
      window
        .atob(normalizedPayload)
        .split("")
        .map(
          (character) =>
            `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`,
        )
        .join(""),
    );

    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
}
