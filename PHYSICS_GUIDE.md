# 🚀 Projectile Motion — Complete Physics Guide

> **For Team Members**: This guide explains every equation used in our simulator, what each one does, and how to solve problems step-by-step if the teacher asks you to calculate by hand.

---

## 📌 What is Projectile Motion?

When you throw an object at an angle into the air, it follows a curved path called a **parabola**. This motion is called **projectile motion**.

**Key Idea**: The horizontal (sideways) and vertical (up-down) motions are **completely independent**. Gravity only affects the vertical motion.

---

## 📋 Variables We Use

| Symbol | Meaning | Unit |
|--------|---------|------|
| **v₀** | Initial velocity (launch speed) | m/s |
| **θ** | Launch angle (from the ground) | degrees (°) |
| **h₀** | Initial height (above ground) | metres (m) |
| **g** | Acceleration due to gravity | 9.8 m/s² (on Earth) |
| **t** | Time elapsed | seconds (s) |
| **x** | Horizontal distance at time t | metres (m) |
| **y** | Vertical height at time t | metres (m) |
| **vₓ** | Horizontal velocity | m/s |
| **vᵧ** | Vertical velocity at time t | m/s |
| **R** | Range (total horizontal distance) | metres (m) |
| **H** | Maximum height reached | metres (m) |
| **T** | Total time of flight | seconds (s) |

---

## 🔢 The Equations (With Explanations)

### 1. Breaking Velocity into Components

When you launch at angle θ with speed v₀, the velocity splits into two parts:

```
Horizontal component:   vₓ = v₀ × cos(θ)
Vertical component:     vᵧ₀ = v₀ × sin(θ)
```

**Why?** Think of it as a right triangle. The launch velocity is the hypotenuse, and cos gives the adjacent (horizontal) side, sin gives the opposite (vertical) side.

**Example**: v₀ = 40 m/s, θ = 45°
```
vₓ  = 40 × cos(45°) = 40 × 0.707 = 28.28 m/s
vᵧ₀ = 40 × sin(45°) = 40 × 0.707 = 28.28 m/s
```

---

### 2. Position at Any Time t

**Horizontal Position (how far sideways):**
```
x(t) = vₓ × t
     = v₀ × cos(θ) × t
```
↳ No acceleration horizontally, so it just moves at constant speed.

**Vertical Position (how high up):**
```
y(t) = h₀ + vᵧ₀ × t − ½ × g × t²
     = h₀ + v₀ × sin(θ) × t − ½ × g × t²
```
↳ Starts at h₀, goes up due to initial vertical speed, but gravity pulls it down (the −½gt² part).

**Example**: v₀ = 40 m/s, θ = 45°, h₀ = 0, g = 9.8. Find position at t = 2 seconds:
```
x(2) = 28.28 × 2 = 56.56 m
y(2) = 0 + 28.28 × 2 − ½ × 9.8 × 2² 
     = 0 + 56.56 − 19.6 
     = 36.96 m
```
**Answer**: After 2 seconds, the projectile is 56.56 m away and 36.96 m high.

---

### 3. Velocity at Any Time t

**Horizontal Velocity (always constant):**
```
vₓ = v₀ × cos(θ)     ← never changes!
```

**Vertical Velocity (changes due to gravity):**
```
vᵧ(t) = v₀ × sin(θ) − g × t
```
↳ Starts positive (going up), becomes 0 at the top, then becomes negative (coming down).

**Speed (magnitude of total velocity):**
```
|v| = √(vₓ² + vᵧ²)
```

**Example**: Same projectile at t = 2s:
```
vₓ    = 28.28 m/s  (unchanged)
vᵧ(2) = 28.28 − 9.8 × 2 = 28.28 − 19.6 = 8.68 m/s  (still going up)
Speed = √(28.28² + 8.68²) = √(799.76 + 75.34) = √875.1 = 29.58 m/s
```

---

### 4. Maximum Height (H)

The projectile reaches maximum height when vertical velocity = 0.

**Time to reach maximum height:**
```
t_apex = vᵧ₀ / g = v₀ × sin(θ) / g
```

**Maximum Height:**
```
H = h₀ + (v₀ × sin(θ))² / (2 × g)
```

**Example**: v₀ = 40 m/s, θ = 45°, h₀ = 0, g = 9.8:
```
t_apex = 28.28 / 9.8 = 2.886 seconds

H = 0 + (28.28)² / (2 × 9.8)
  = 799.76 / 19.6
  = 40.80 m
```
**Answer**: The projectile reaches 40.80 metres at t = 2.886 seconds.

---

### 5. Total Time of Flight (T)

The projectile lands when y = 0. We solve:
```
0 = h₀ + v₀ × sin(θ) × T − ½ × g × T²
```

**If launched from ground (h₀ = 0):**
```
T = 2 × v₀ × sin(θ) / g
```
↳ Notice: T = 2 × t_apex (time up = time down, it's symmetric!)

**If launched from height h₀ > 0:**
```
T = [v₀ × sin(θ) + √(v₀² × sin²(θ) + 2 × g × h₀)] / g
```
↳ This uses the quadratic formula.

**Example** (from ground): v₀ = 40 m/s, θ = 45°, h₀ = 0:
```
T = 2 × 28.28 / 9.8 = 56.56 / 9.8 = 5.77 seconds
```

---

### 6. Range (R) — Total Horizontal Distance

```
R = vₓ × T = v₀ × cos(θ) × T
```

**If launched from ground (h₀ = 0), there's a shortcut:**
```
R = v₀² × sin(2θ) / g
```
↳ Note: sin(2θ) = 2 × sin(θ) × cos(θ)

**Example**: v₀ = 40 m/s, θ = 45°, h₀ = 0:
```
R = 40² × sin(90°) / 9.8
  = 1600 × 1 / 9.8
  = 163.27 m
```
**Answer**: The projectile lands 163.27 metres away.

---

### 7. Impact Speed (Speed When it Hits the Ground)

```
vₓ_impact = v₀ × cos(θ)                          ← same as launch
vᵧ_impact = v₀ × sin(θ) − g × T                  ← negative (going down)
Impact Speed = √(vₓ_impact² + vᵧ_impact²)
```

**Example**: At T = 5.77 seconds:
```
vₓ = 28.28 m/s
vᵧ = 28.28 − 9.8 × 5.77 = 28.28 − 56.55 = −28.27 m/s
Impact Speed = √(28.28² + 28.27²) = √(1599.8) = 40.0 m/s
```
**Notice**: When h₀ = 0, impact speed = launch speed! (Energy conservation)

---

## 🧪 Complete Worked Example

**Problem**: A ball is launched at **50 m/s** at an angle of **30°** from the ground. Find everything.

### Step 1: Find Components
```
vₓ  = 50 × cos(30°) = 50 × 0.866 = 43.30 m/s
vᵧ₀ = 50 × sin(30°) = 50 × 0.500 = 25.00 m/s
```

### Step 2: Maximum Height
```
H = (25.00)² / (2 × 9.8) = 625 / 19.6 = 31.89 m
```

### Step 3: Time to Max Height
```
t_apex = 25.00 / 9.8 = 2.55 s
```

### Step 4: Total Time of Flight
```
T = 2 × 25.00 / 9.8 = 50 / 9.8 = 5.10 s
```

### Step 5: Range
```
R = 43.30 × 5.10 = 220.83 m
```
**OR using shortcut:**
```
R = 50² × sin(60°) / 9.8 = 2500 × 0.866 / 9.8 = 220.92 m ✓
```

### Step 6: Impact Speed
```
Speed = 50 m/s  (same as launch speed when h₀ = 0)
```

### Summary Table
| Quantity | Value |
|----------|-------|
| Horizontal velocity (vₓ) | 43.30 m/s |
| Initial vertical velocity (vᵧ₀) | 25.00 m/s |
| Maximum height (H) | 31.89 m |
| Time to apex | 2.55 s |
| Total flight time (T) | 5.10 s |
| Range (R) | 220.92 m |
| Impact speed | 50.00 m/s |

---

## ⚡ Quick Reference — Important Facts

| Fact | Explanation |
|------|-------------|
| **45° gives maximum range** | On flat ground, sin(2×45°) = sin(90°) = 1, which is the maximum value |
| **Complementary angles = same range** | 30° and 60° give the same range (but different heights) |
| **Time up = Time down** | When h₀ = 0, the trajectory is symmetric |
| **Horizontal velocity never changes** | No horizontal force (no air resistance) |
| **Vertical velocity = 0 at apex** | The ball momentarily stops going up before falling down |
| **Impact speed = Launch speed** | When h₀ = 0, energy is conserved |

---

## 🌍 Gravity on Different Planets

| Planet | g (m/s²) | How it affects motion |
|--------|----------|----------------------|
| 🌍 Earth | 9.8 | Standard — our default |
| 🌙 Moon | 1.62 | ~6× less gravity → goes much higher & farther |
| 🔴 Mars | 3.72 | ~2.6× less gravity → higher & farther than Earth |
| 🟠 Jupiter | 24.79 | ~2.5× more gravity → shorter range & lower height |

**Formula reminder**: Lower g → Higher H, Longer T, Greater R (for same v₀ and θ).

---

## 📝 Assumptions in Our Simulator

1. **No air resistance** — In reality, air slows things down
2. **Flat ground** — We ignore Earth's curvature
3. **Constant gravity** — g doesn't change with height
4. **Point mass** — The projectile has no size or spin
5. **2D motion** — Everything happens in one vertical plane

---

## 🔧 How Our Simulator Uses These Equations

1. **Before launch**: We use the equations to pre-calculate Range, Max Height, and Total Time (shown in the Summary panel)
2. **During animation**: We update position frame-by-frame using:
   ```
   vᵧ = vᵧ − g × Δt        (gravity reduces vertical speed)
   x  = x + vₓ × Δt         (move horizontally)
   y  = y + vᵧ × Δt         (move vertically)
   ```
3. **On canvas**: We mark APEX, LAUNCH, LAND points and show time markers
4. **Analysis charts**: Range vs Angle uses the range formula for every angle from 1° to 89°

---

## 📐 Calculator Tip

Make sure your calculator is in **DEGREE mode**, not radian mode!

- **cos(45°) = 0.707** ✓
- If you get cos(45) = 0.525, your calculator is in radian mode — switch it!

---

*Made for our Physics Project — Projectile Motion Simulator*
*GitHub: https://github.com/tarang124/projectile-motion-simulator*
