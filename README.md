# 🚀 Projectile Motion Simulator

An interactive physics simulator that visualizes projectile motion in real-time. Built with pure HTML, CSS, and JavaScript — no external libraries.

![Physics Project](https://img.shields.io/badge/Physics-Project-818cf8?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

### 🎮 Interactive Simulator
- Adjustable **velocity**, **angle**, **initial height**, and **gravity**
- **Planet presets** — Earth, Moon, Mars, Jupiter
- Real-time animated trajectory with glowing projectile
- Velocity vectors (Vx, Vy, resultant) displayed during flight
- Toggle Grid, Vectors, and Trace on/off

### 📐 Live Data Dashboard
- Real-time: Time, Position (x, y), Velocity components, Speed
- Summary: Range, Max Height, Total Time, Impact Speed

### 📚 Theory Section
- What is Projectile Motion (with SVG diagrams)
- All key equations of motion
- Assumptions and conditions
- Special cases and insights

### 📊 Analysis Tools
- **Compare multiple trajectories** side-by-side
- **Range vs Angle chart** — see how angle affects range
- **Height vs Time chart** — compare vertical motion across trajectories

## 🛠️ Tech Stack

- **HTML5** — Semantic structure
- **CSS3** — Glassmorphism dark theme, animations, responsive design
- **JavaScript** — Physics engine, Canvas rendering, charting

**Zero external dependencies.**

## 🚀 Getting Started

Simply open `index.html` in any modern browser:

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/projectile-motion-simulator.git

# Open in browser
start index.html
```

## 📷 Screenshots

Launch the simulator and explore projectile trajectories with different parameters!

## 📝 Physics Equations Used

| Quantity | Formula |
|----------|---------|
| Horizontal Position | `x(t) = v₀ · cos(θ) · t` |
| Vertical Position | `y(t) = h₀ + v₀ · sin(θ) · t − ½gt²` |
| Max Height | `H = h₀ + (v₀ · sin(θ))² / 2g` |
| Range (h₀=0) | `R = v₀² · sin(2θ) / g` |
| Time of Flight | `T = 2v₀ · sin(θ) / g` |

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
