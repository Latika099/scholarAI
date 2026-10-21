/**
 * GitHub Profile Service
 * Retrieves verified public profile and repository information from GitHub REST API.
 * Never fabricates achievements or projects. Gracefully handles rate limits or unreachable endpoints.
 */

export async function fetchGitHubProfile(inputUrlOrUsername) {
  if (!inputUrlOrUsername || typeof inputUrlOrUsername !== 'string') {
    return { success: false, error: 'No GitHub profile URL or username provided.' };
  }

  // Clean username from full URL or @handle
  let username = inputUrlOrUsername.trim();
  username = username.replace(/^https?:\/\/(www\.)?github\.com\//i, '');
  username = username.replace(/^@/, '');
  username = username.split('/')[0].split('?')[0].trim();

  if (!username) {
    return { success: false, error: 'Invalid GitHub username or URL format.' };
  }

  try {
    const headers = {
      'User-Agent': 'ScholarAI-Agentic-Copilot/1.0',
      'Accept': 'application/vnd.github.v3+json'
    };

    // 1. Fetch User Profile
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers });
    
    if (userRes.status === 404) {
      return {
        success: false,
        error: `GitHub user '${username}' not found on public GitHub API.`,
        username
      };
    }

    if (userRes.status === 403) {
      // Rate limited by GitHub API
      return {
        success: true,
        isRateLimited: true,
        username,
        profileUrl: `https://github.com/${username}`,
        summary: `GitHub user @${username} linked. Public API rate limit reached; basic handle recorded without simulated data.`,
        publicReposCount: null,
        topLanguages: [],
        highlightedProjects: []
      };
    }

    if (!userRes.ok) {
      throw new Error(`GitHub API returned status ${userRes.status}`);
    }

    const userData = await userRes.json();

    // 2. Fetch User Public Repositories (up to 10 most recently updated)
    const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=10`, { headers });
    let reposData = [];
    if (reposRes.ok) {
      reposData = await reposRes.json();
    }

    // Process languages and projects
    const languageCounts = {};
    const highlightedProjects = [];

    reposData.forEach(repo => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
      if (!repo.fork) {
        highlightedProjects.push({
          name: repo.name,
          description: repo.description || 'No description provided',
          stars: repo.stargazers_count,
          language: repo.language || 'Code',
          url: repo.html_url,
          updatedAt: repo.updated_at
        });
      }
    });

    const topLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);

    return {
      success: true,
      username,
      name: userData.name || username,
      bio: userData.bio || '',
      profileUrl: userData.html_url,
      avatarUrl: userData.avatar_url,
      publicReposCount: userData.public_repos,
      followersCount: userData.followers,
      topLanguages,
      highlightedProjects: highlightedProjects.slice(0, 5),
      summary: `Verified GitHub profile for @${username} (${userData.public_repos} public repos, top languages: ${topLanguages.slice(0, 3).join(', ') || 'Various'}).`
    };
  } catch (err) {
    console.warn(`GitHub profile fetch warning for ${username}:`, err.message);
    // Graceful offline/error fallback
    return {
      success: true,
      isOfflineFallback: true,
      username,
      profileUrl: `https://github.com/${username}`,
      summary: `Public GitHub profile link registered (@${username}). Note: Network fetch encountered ${err.message}.`,
      topLanguages: [],
      highlightedProjects: []
    };
  }
}
