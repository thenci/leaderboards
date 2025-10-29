const CSV_URL = "https://docs.google.com/spreadsheets/d/10vvu0DJXvXhWkYfiAyOElugNgaFr56052E8xV8t7sWw/export?format=csv&gid=0";

// Map points → rank *label* (you changed to names, which is fine)
function computeRank(score) {
  const s = Number(score) || 0;
  if (s <= 50)   return 'Private';
  /*if (s <= 300)  return 'Bot';
   if (s <= 500)  return 'Young';
  if (s <= 800)  return 'Big Steppa';
  if (s <= 999)  return 'Mafia Boss';*/
  if (s = 9999)  return 'Moderator';
  return 'Master Prestige'; // 1000+
}

// Map points → color class (drives styling)
function getStyleClassByPoints(pointsLike) {
  const s = Number(pointsLike) || 0;
  if (s <= 50)   return 'grey';
  if (s <= 300)  return 'blue';
  if (s <= 500)  return 'brown';
  if (s <= 800)  return 'green';
  if (s <= 999)  return 'purple';
  return ''; // 1000+ → default styling
}

/**
 * Build one row
 */
function createRowElement({ name = '', rank = '', points = 0 }) {
  const row = document.createElement('div');
  row.className = 'row';

  const nameDiv = document.createElement('div');
  nameDiv.className = 'name';
  nameDiv.textContent = name;

  const rankDiv = document.createElement('div');
  rankDiv.className = 'rank';
  rankDiv.textContent = rank;

  const pointsDiv = document.createElement('div');
  pointsDiv.className = 'points';
  pointsDiv.textContent = points;

  // 👉 Apply color class based on points
  const styleClass = getStyleClassByPoints(points);
  if (styleClass) {
    rankDiv.classList.add(styleClass);   // color the rank label
    pointsDiv.classList.add(styleClass); // color the points number
  }

  row.appendChild(nameDiv);
  row.appendChild(rankDiv);
  row.appendChild(pointsDiv);
  return row;
}

async function loadLeaderboard() {
  try {
    const res = await fetch(CSV_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

    const csv = await res.text();
    const { data, errors } = Papa.parse(csv, { skipEmptyLines: true });
    if (errors && errors.length) console.warn('PapaParse warnings/errors', errors);

    if (!data || data.length < 2) {
      console.warn('No data found in CSV');
      return;
    }

    const [header, ...rows] = data;
    const nameIdx = header.indexOf('Name');
    const scoreIdx = header.indexOf('Score');

    const players = rows.map(r => {
      const name = nameIdx >= 0 ? r[nameIdx] : (r[0] || '');
      const rawScore = scoreIdx >= 0 ? r[scoreIdx] : 0;
      const score = Number(rawScore) || 0;
      const rank = computeRank(score); // rank label (not used for color)
      return { name, score, rank };
    });

    players.sort((a, b) => b.score - a.score);

    const app = document.getElementById('app') || document.body;
    let boardsParent = document.getElementById('boards');
    if (!boardsParent) {
      boardsParent = document.createElement('div');
      boardsParent.id = 'boards';
      app.appendChild(boardsParent);
    }
    boardsParent.innerHTML = '';

    players.forEach((p, index) => {
      const board = document.createElement('div');
      board.className = 'leaderboard player-board';
      board.setAttribute('data-player-index', String(index));

      const headerEl = document.createElement('div');
      headerEl.className = 'board-header';
      board.appendChild(headerEl);

      const rowEl = createRowElement({ name: p.name, rank: p.rank, points: p.score });
      board.appendChild(rowEl);

      boardsParent.appendChild(board);
    });
  } catch (err) {
    console.error('Error loading leaderboard:', err);
  }
}

async function autoUpdate() {
  await loadLeaderboard();
  setTimeout(autoUpdate, 10 * 60 * 1000); // schedule next run
}

autoUpdate(); // start loop





