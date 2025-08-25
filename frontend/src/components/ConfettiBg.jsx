import React, { useEffect } from "react";

const ConfettiBackground = () => {
  useEffect(() => {
    const canvas = document.getElementById("confettiCanvas");
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#9D4EDD"];
    const confetti = Array.from({ length: 200 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      w: Math.random() * 8 + 4,
      h: Math.random() * 12 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      dy: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 1,
      tilt: Math.random() * 10,
      tiltAngleIncrement: Math.random() * 0.07 + 0.05,
      tiltAngle: 0,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confetti.forEach((c) => {
        c.tiltAngle += c.tiltAngleIncrement;
        c.y += c.dy;
        c.x += c.dx;
        c.tilt = Math.sin(c.tiltAngle) * 12;

        if (c.y > canvas.height) {
          c.y = -10;
          c.x = Math.random() * canvas.width;
        }

        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.ellipse(c.x + c.tilt, c.y, c.w / 2, c.h / 2, Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    draw();

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      id="confettiCanvas"
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default ConfettiBackground;
