const CSV_URL = 'https://app.trevor.io/share/view/7794ab07-e8af-4386-a596-0a44a064109c/1d/pennygambl3r_Affiliate_Stake_com_Wager_Race_Statistics.csv?seed=29';

const prizesUnder75k = { 1: 100, 2: 80, 3: 60, 4: 40, 5: 20, 6: 4, 7: 4, 8: 4, 9: 4, 10: 4 };
const prizes75k = { 1: 106.25, 2: 85, 3: 63.75, 4: 42.50, 5: 21.25, 6: 4.25, 7: 4.25, 8: 4.25, 9: 4.25, 10: 4.25 };
const prizes150k = { 1: 112.50, 2: 90, 3: 67.50, 4: 45.50, 5: 22.50, 6: 4.50, 7: 4.50, 8: 4.50, 9: 4.50, 10: 4.50 };
const prizes225k = { 1: 118.75, 2: 95, 3: 71.25, 4: 47.50, 5: 23.75, 6: 4.75, 7: 4.75, 8: 4.75, 9: 4.75, 10: 4.75 };
const prizes300k = { 1: 125, 2: 100, 3: 75, 4: 50, 5: 25, 6: 5, 7: 5, 8: 5, 9: 5, 10: 5 };

let leaderboardStartDate = new Date('2024-02-01T00:00:00Z'); // Fixed start date (Feb 1, 2024)
let leaderboardEndDate = new Date(leaderboardStartDate);
leaderboardEndDate.setDate(leaderboardStartDate.getDate() + 28); // Set the end date to 28 days after the start date

// 🎯 Update Countdown Timer
function updateCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    const now = new Date();
    const timeUntilStart = leaderboardStartDate - now;
    const timeLeft = leaderboardEndDate - now;

    console.log('Current Time:', now);
    console.log('Leaderboard Start Date:', leaderboardStartDate);
    console.log('Leaderboard End Date:', leaderboardEndDate);
    console.log('Time Until Start:', timeUntilStart);
    console.log('Time Left:', timeLeft);

    if (timeUntilStart > 0) {
        // Countdown until the leaderboard starts
        const days = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeUntilStart % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `
            <span class="label">Leaderboard starts in:</span>
            <span>${days}d ${hours}h ${minutes}m ${seconds}s</span>
        `;
    } else if (timeLeft > 0) {
        // Countdown until the leaderboard ends
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `
            <span class="label">Leaderboard ends in:</span>
            <span>${days}d ${hours}h ${minutes}m ${seconds}s</span>
        `;
    } else {
        // The leaderboard has ended, prepare for the next period
        const nextStartDate = new Date(leaderboardStartDate);
        nextStartDate.setMonth(nextStartDate.getMonth() + 1); // Move to next month
        leaderboardStartDate = nextStartDate;
        leaderboardEndDate.setMonth(leaderboardEndDate.getMonth() + 1); // Update end date accordingly

        updateLeaderboard(); // Refresh leaderboard for the new period
        countdownElement.innerHTML = `
            <span class="label">Leaderboard has ended. New period starts in:</span>
            <span>${Math.floor((leaderboardStartDate - now) / (1000 * 60 * 60 * 24))}d</span>
        `;
        updateCountdown(); // Update countdown to the next period
    }
}

// 📊 Fetch CSV Data
async function fetchCSVData(url) {
    try {
        console.log('Fetching CSV data from URL...');
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error('Failed to fetch CSV data:', response.status, response.statusText);
            return [];
        }

        const data = await response.text();
        console.log('CSV Data fetched:', data); // Debug log to verify data fetch
        return parseCSV(data);
    } catch (error) {
        console.error('Error fetching CSV data:', error);
        return [];
    }
}

// 📝 Parse CSV Data
function parseCSV(data) {
    const rows = data.split('\n').slice(1); // Skip the first row (header)
    console.log('CSV Rows:', rows); // Debug log to verify the CSV rows

    return rows.map(row => {
        const [affiliate_name, campaign_code, user_name, wagered, rank, start_date_utc, end_date_utc] = row.split(',');
        
        // Only return rows with meaningful data (skip empty rows)
        if (!affiliate_name || !user_name || !wagered || !rank || !start_date_utc) {
            return null;
        }

        return {
            affiliate_name,
            campaign_code,
            user_name,
            wagered: parseFloat(wagered) || 0,
            rank: parseInt(rank) || 0,
            start_date_utc,
            end_date_utc
        };
    }).filter(row => row !== null); // Filter out any null values
}

// 🚀 Update Leaderboard
async function updateLeaderboard() {
    try {
        const data = await fetchCSVData(CSV_URL);
        console.log('Parsed CSV Data:', data); // Debug log to verify parsed data

        const validData = data.sort((a, b) => a.rank - b.rank);

        if (validData.length > 0) {
            populateTopRanks(validData);
            populateLeaderboard(validData);
        }

    } catch (error) {
        console.error('Error updating leaderboard:', error);
    }
}

// 🗓️ Populate Top Ranks with Gift Emoji
function populateTopRanks(data) {
    const topRanks = data.slice(0, 3);
    topRanks.forEach((row, index) => {
        const rank = index + 1;
        let reward = `$${getPrize(row.wagered, row.rank).toFixed(2)}`;

        // Add the gift emoji to rank 1, 2, and 3
        if (rank === 1 || rank === 2 || rank === 3) {
            reward = `🎁${reward}`; // Gift emoji for top 3 ranks
        }

        updateElement(`user-${rank}`, row.user_name);
        updateElement(`wagered-${rank}`, `$${row.wagered.toFixed(2)}`);
        updateElement(`reward-${rank}`, reward, false); // False to allow HTML in the reward
    });
}

// 🗓️ Populate Leaderboard Table
function populateLeaderboard(data) {
    const leaderboardBody = document.getElementById('leaderboard-body');
    leaderboardBody.innerHTML = '';

    data.slice(3, 20).forEach((row) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.rank}</td>
            <td>${row.user_name}</td>
            <td>$${row.wagered.toFixed(2)}</td>
            <td>$${getPrize(row.wagered, row.rank).toFixed(2)}</td>
        `;
        tr.classList.add('fade-in'); // Add fade-in class
        leaderboardBody.appendChild(tr);
    });

    const totalWagerAmount = data.reduce((sum, row) => sum + row.wagered, 0);
    const startDate = new Date(data[0].start_date_utc).toLocaleDateString();
    const endDate = new Date(data[0].end_date_utc).toLocaleDateString();

    updateElement('week-info', `${startDate} to ${endDate}`);
    updateElement('total-wager', `$${totalWagerAmount.toFixed(2)}`);
}

// 🎁 Get Prize Based on Rank and Wagered Amount
function getPrize(wagered, rank) {
    if (wagered < 75000) {
        return prizesUnder75k[rank] || 0;
    } else if (wagered < 150000) {
        return prizes75k[rank] || 0;
    } else if (wagered < 225000) {
        return prizes150k[rank] || 0;
    } else if (wagered < 300000) {
        return prizes225k[rank] || 0;
    } else {
        return prizes300k[rank] || 0;
    }
}

// 🔄 Update DOM Elements
function updateElement(elementId, value, animate = true) {
    const element = document.getElementById(elementId);
    if (element) {
        if (animate) {
            element.style.animation = 'none';
            element.offsetHeight; // Trigger reflow
            element.style.animation = 'glitch 0.3s ease';
        }
        element.textContent = value;
    }
}

// 🕒 Auto-update leaderboard every 12 hours
setInterval(updateLeaderboard, 12 * 60 * 60 * 1000);

// Initial Load
updateLeaderboard();

// Start the countdown immediately
const countdownInterval = setInterval(updateCountdown, 1000);

// Ensure countdown starts accurately
updateCountdown();

(function() {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-2N6WBR7DEW';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-2N6WBR7DEW');
})();
