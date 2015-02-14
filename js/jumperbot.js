var JumperBot = function () {
    var canvas = document.getElementById('swingbot'),
        bot = {},
        bullet = {},
        context = canvas.getContext('2d'),
        bars = [],
        barCount = 3,
        barWidth = 100,
        barHeight = 15,
        firedPointX = 0,
        firedPointY = 0,
        barHitPointX = 0,
        barHitPointY = 0,
        barHit = false,
        moveBars = false,
        firedPointDist = 0,
        swingX = 0,
        currScore = 0,
        topScore = 0,
        isActive = false,  // If the bot is in the move
        swingY = 0,
        botImg = '',
        bulletFired = false,
        swingBot = false,
        bulletSpeed = 15, // Higher it is, faster the bullet will be
        swingSpeed = 30;  // Higher it is, slower the bot will swing

    canvas.width = 400;
    canvas.height = 500;

    context = canvas.getContext('2d');
    context.lineWidth = 2;

    var relAngleX, relAngleY, relFiredPointX, relFiredPointY;

    function setBullet () {
        bullet.posX = 0;
        bullet.posY = 0;
        bullet.height = 4;
        bullet.width = 4;
    }

    function setBot () {
        bot.width = 24;
        bot.height = 37;
        bot.posX = canvas.width / 2;
        bot.posY = canvas.height - bot.height - 50;

        botImg = new Image();
        botImg.src = "img/bot.svg";
    }

    function setBars () {
        // Generate the bars positions
        for (var i = 0; i < barCount; i++) {
            bars.push({
                posX: Math.random() * ( canvas.width / 2 ),
                posY: (( canvas.height / barCount ) * i) + 20     // So to make the bars span the whole height
            });
        };
    }

    setBars();
    setBullet();
    setBot();

    canvas.onclick = function ( ev ) {

        // Reset the bar hit or it will start throwing the rope
        // ..instead of the bullet
        barHit = false;
        isActive = true;

        firedPointX = ev.clientX;
        firedPointY = ev.clientY;

        relFiredPointX = firedPointX - bot.posX;
        relFiredPointY = firedPointY - bot.posY;

        relAngleX = relAngleY = Math.atan2(relFiredPointY, relFiredPointX) * 57.32;

        bulletFired = true;
    }

    window.setInterval(function () {
        // Clear 
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create the player
        // context.fillRect(bot.posX, bot.posY, bot.width, bot.height);
        context.drawImage(botImg, bot.posX, bot.posY);

        context.fillText(currScore + '/' + topScore, 5, 15);

        // Draw the bars
        for (var i = 0; i < barCount; i++) {

            if ( bars[i].posY > canvas.height ) {
                bars[i].posX = Math.random() * ( canvas.width / 2 );
                bars[i].posY = 0
            }

            // Moving the bar upwards
            if ( moveBars ) {
                bars[i].posY = bars[i].posY - swingY * 4;
            };

            context.fillRect(bars[i].posX, bars[i].posY, barWidth, barHeight);
        };

        if ( isActive ) {
            // If the bullet gets fired
            if ( bulletFired ) {
                
                // If it is the first frame after bullet got fired
                if ( !bullet.posX && !bullet.posY ) {
                    bullet.posX = bot.posX;
                    bullet.posY = bot.posY;
                };

                // Increment the bullet position so that it may move to the position
                // ..towards which it is fired
                bullet.posX += Math.cos(relAngleX * 0.017) * bulletSpeed;
                bullet.posY -= Math.sin(relAngleY * -0.017) * bulletSpeed;

                // If the bullet tries to go outside the canvas in sideways
                if ( ( bullet.posX > canvas.width ) || ( bullet.posX < 0 ) ) {
                    // To divert the bullet in the reverse direction
                    relAngleX = relAngleX - relAngleY;
                };

                // To check if the bullet has hit any of the bars
                for (var i = 0; i < barCount; i++) {

                    // If the bullet's current position overlaps with 
                    // any of the bars
                    if ((
                        bullet.posX >= bars[i].posX &&
                        bullet.posX <= ( bars[i].posX + barWidth )
                    ) && (
                        bullet.posY >= bars[i].posY &&
                        bullet.posY <= ( bars[i].posY + barHeight ) 
                    )) {                        
                        // No bullet fired, it was a bar hit
                        bulletFired = false;
                        barHit = true;

                        // Since the player has got a rope in his hand
                        // ..now swing
                        swingBot = true;
                            
                        // Change the fired point, as this is the point where the rope will be thrown
                        firedPointX = bullet.posX;
                        firedPointY = bullet.posY;

                        // Reset the bullet position
                        bullet.posX = bullet.posY = 0;

                        return;
                    };

                    barHit = false;
                };

                // Show the bullet
                context.fillRect(bullet.posX, bullet.posY, bullet.width, bullet.height);

                // If the bullet goes out of the top of canvas
                if ( bullet.posY < 0 ) {
                    // Reset that bullet
                    bullet.posX = bullet.posY = 0;
                    bulletFired = false
                };

            };

            if ( moveBars ) {
                firedPointY = firedPointY - swingY * 4;

                // Increase the score only if the bars are moving
                currScore++;
            }


            // If the bar was hit and the fired point is not below the bot
            // bot.posY > ( firedPointY + 20 ) because we want the bot to leave the rope if the hook goes lower to him
            if ( barHit && bot.posY > ( firedPointY + 20 ) ) {
                context.beginPath();
                // Changed the `x` a bit, so that the rope comes out of the head of the bot
                context.moveTo( (bot.posX + bot.width / 2), bot.posY );
                context.lineTo(firedPointX, firedPointY);
                context.stroke();

                firedPointDist = Math.sqrt(Math.pow((bot.posX - firedPointX), 2) + Math.pow((bot.posY - firedPointY), 2));

                swingX += ( firedPointX - bot.posX ) / (firedPointDist * swingSpeed);
                swingY += ( firedPointY - bot.posY ) / (firedPointDist * swingSpeed);

            } else {
                barHit = false;
            };

            // If the bot is within the visible canvas
            if ( swingY > 0 ) {
                moveBars = false;
            };

            // To simulate gravity i.e. the bot may 
            // get slowly pulled down
            swingY += 0.01;

            moveBars || (bot.posY += swingY * 4);
            bot.posX += swingX;

            // If the bot is about to reach the top
            if ( bot.posY < ( canvas.width / 2 ) ) {
                moveBars = true;
            };

            // If the bot tries to go outside the canvas
            if ( bot.posX < 0 || ( bot.posX + bot.width ) > canvas.width ) {
                swingX = -swingX; // Swing it backward
            };

            // If the bot goes down the bottom of the canvas
            if ( bot.posY > canvas.height ) {
                isActive = false; // Bot is dead
            };

        } else {
            // Reset everything
            setBars();
            setBullet();
            setBot();

            swingX = swingY = firedPointX = firedPointY = firedPointDist = 0;
            relAngleX = relAngleY = 0;
            moveBars = barHit = swingBot = false;

            if ( currScore > topScore ) {
                topScore = currScore;
            };

            currScore = 0;
        }

    }, 10);
}