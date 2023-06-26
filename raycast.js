function toRadians(angle) {
    return angle * Math.PI / 180;
}
const TICK = 24;
const FOV = toRadians(60);
const cscale = 32;
const mscale = 10;
const player = {
    x: cscale * 1.5,
    y: cscale * 2,
    angle: toRadians(0),
    speed: 0,
};
const map = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];

const m = document.createElement('canvas');
m.setAttribute('width', 1024);
m.setAttribute('height', 576);
m.style.border = "1px solid black";
document.body.appendChild(m);
const mc = m.getContext("2d");
const mm = document.createElement('canvas');
mm.setAttribute('width', 480);
mm.setAttribute('height', 260);
mm.style.border = "1px solid black";
document.body.appendChild(mm);
const mmc = mm.getContext("2d");
function fixFishEye(d, angle, playerAngle) {
    const diff = angle - playerAngle;
    return d * Math.cos(diff);
}

function drawScene(rays) {
    rays.forEach((ray, i) => {
        const distance = fixFishEye(ray.distance, ray.angle, player.angle);
        const wallHeight = ((mscale * 10) / distance) * 277;
        mc.fillStyle = ray.vertical ? "#003f5c" : "#58508d";
        mc.fillRect(i, m.height / 2 - wallHeight / 2, 1, wallHeight);
        mc.fillStyle = "#ff6361";
        mc.fillRect(
            i,
            m.height / 2 + wallHeight / 2,
            1,
            m.height / 2 - wallHeight / 2
        );
        mc.fillStyle = "#012975";
        mc.fillRect(i, 0, 1, m.height / 2 - wallHeight / 2);
    });
}
function drawMiniMap(scale, rays) {
    //drawing the mini map
    for (let i = 0; i < map[0].length; i++) {
        for (let j = 0; j < map.length; j++) {
            if (map[j][i]) {
                mmc.fillStyle = 'blue'
                mmc.fillRect(i * cscale, j * cscale, cscale, cscale);
            }
        }
    }
    //drawing the character
    mmc.fillStyle = 'red';
    mmc.fillRect(player.x - 10, player.y - 10, 20, 20);
    mmc.strokeStyle = "blue";
    mmc.beginPath();
    mmc.moveTo(player.x, player.y);
    mmc.lineTo(
        (player.x + Math.cos(player.angle) * 20) * scale,
        (player.y + Math.sin(player.angle) * 20) * scale
    );
    mmc.closePath();
    mmc.stroke();

    //drawing the rays
    mmc.strokeStyle = "#5bd45f";
    rays.forEach((ray) => {
        mmc.beginPath();
        mmc.moveTo(player.x, player.y);
        mmc.lineTo(player.x + Math.cos(ray.angle) * ray.distance,
            player.y + Math.sin(ray.angle) * ray.distance);
        mmc.closePath();
        mmc.stroke();
    });

}
function clearScreen() {
    mmc.clearRect(0, 0, mm.width, mm.height);
}
function playerMovement() {
    player.x += Math.cos(player.angle) * player.speed;
    player.y += Math.sin(player.angle) * player.speed;
}
function dist(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
function outOfBound(i, j) {
    return i < 0 || j < 0 || i >= map[0].length || j >= map.length;
}
function getVertCollision(angle) {
    const right = Math.abs(Math.floor((angle - Math.PI / 2) / Math.PI) % 2);

    const firstX = right
        ? Math.floor(player.x / cscale) * cscale + cscale
        : Math.floor(player.x / cscale) * cscale;

    const firstY = player.y + (firstX - player.x) * Math.tan(angle);

    const xA = right ? cscale : -cscale;
    const yA = xA * Math.tan(angle);

    let wall;
    let nextX = firstX;
    let nextY = firstY;
    while (!wall) {
        const cellX = right
            ? Math.floor(nextX / cscale)
            : Math.floor(nextX / cscale) - 1;
        const cellY = Math.floor(nextY / cscale);

        if (outOfBound(cellX, cellY)) {
            break;
        }
        wall = map[cellY][cellX];
        if (!wall) {
            nextX += xA;
            nextY += yA;
        } else {
        }
    }
    return {
        angle,
        distance: dist(player.x, player.y, nextX, nextY),
        vertical: true,
    };
}

function getHoriCollision(angle) {
    const up = Math.abs(Math.floor(angle / Math.PI) % 2);
    const firstY = up
        ? Math.floor(player.y / cscale) * cscale
        : Math.floor(player.y / cscale) * cscale + cscale;
    const firstX = player.x + (firstY - player.y) / Math.tan(angle);

    const yA = up ? -cscale : cscale;
    const xA = yA / Math.tan(angle);

    let wall;
    let nextX = firstX;
    let nextY = firstY;
    while (!wall) {
        const cellX = Math.floor(nextX / cscale);
        const cellY = up
            ? Math.floor(nextY / cscale) - 1
            : Math.floor(nextY / cscale);

        if (outOfBound(cellX, cellY)) {
            break;
        }

        wall = map[cellY][cellX];
        if (!wall) {
            nextX += xA;
            nextY += yA;
        }
    }
    return {
        angle,
        distance: dist(player.x, player.y, nextX, nextY),
        vertical: false,
    };
}
function castRay(angel) {
    const vCollision = getVertCollision(angel);
    const hCollision = getHoriCollision(angel);

    return hCollision.distance >= vCollision.distance ? vCollision : hCollision;
}
function getRays() {
    const initialAngle = player.angle - FOV / 2;
    const numberOfRays = mm.width;
    const angelStep = FOV / numberOfRays;
    return Array.from({ length: numberOfRays }, (_, i) => {
        const ray_angle = initialAngle + i * angelStep;
        const ray = castRay(ray_angle);
        return ray;
    });
}
function getRaysBig()
{
    const initialAngle = player.angle - FOV / 2;
    const numberOfRays = m.width;
    const angelStep = FOV / numberOfRays;
    return Array.from({ length: numberOfRays }, (_, i) => {
        const ray_angle = initialAngle + i * angelStep;
        const ray = castRay(ray_angle);
        return ray;
    });
}
function gameLoop() {
    clearScreen();
    const rays = getRays();
    const raysbig = getRaysBig();
    //console.log(rays);
    playerMovement();
    drawMiniMap(1, rays);
    drawScene(raysbig);
}

document.body.addEventListener('keydown', (event) => {
    if (event.key == 'w') {
        player.speed = 2;
    }
    if (event.key == 's') {
        player.speed = -2;
    }
    if (event.key == 'a') {
        player.angle -= toRadians(5);
    }
    if (event.key == 'd') {
        player.angle += toRadians(5);
    }
})
document.body.addEventListener('keyup', (event) => {
    if (event.key == 'w' || event.key == 's') {
        player.speed = 0;
    }
})
document.addEventListener('mousemove', (event) => {
    player.angle += toRadians(event.movementX * 0.5);
})
setInterval(gameLoop, 1000 / 64);