-- Seed Data for MindfulFeed Posts
-- Run: npx wrangler d1 execute mindfulfeed --file=./db-seed.sql

INSERT OR REPLACE INTO posts (id, title, caption, content, category, image_url, xp, attention_score, content_quality, read_time, views, comments, author_name, author_avatar, author_level, tags) VALUES
(
  'post-1',
  'The Future of AI in Daily Life',
  'How artificial intelligence is transforming the way we live, work, and connect with others.',
  '# Understanding AI Integration

Artificial Intelligence has become an integral part of our daily routines, often in ways we don''t even realize. From personalized recommendations on streaming platforms to smart home devices that learn our preferences, AI is quietly revolutionizing modern life.

## The Morning Routine Revolution

Consider your morning routine. Your alarm clock might use AI to wake you during your lightest sleep phase. Your coffee maker can learn when you typically wake up and have your brew ready. Your news app curates articles based on your reading habits and interests.

## Work and Productivity

In the workplace, AI assists with:

- **Email Management**: Smart filtering and priority inbox
- **Calendar Optimization**: Suggesting meeting times based on everyone''s schedule
- **Document Analysis**: Quickly summarizing long reports
- **Code Assistance**: Helping developers write better code faster

## Entertainment Personalization

Streaming services use sophisticated AI algorithms to understand not just what you watch, but when you watch it, how you watch it, and what mood you''re likely in. This creates an increasingly personalized entertainment experience.

## Health and Wellness

AI-powered health apps can:
- Track your activity patterns
- Provide personalized workout recommendations
- Monitor sleep quality
- Suggest dietary improvements
- Even detect potential health issues early

## The Future Ahead

As AI continues to evolve, we''ll see even deeper integration into our lives. Smart cities will optimize traffic flow, energy consumption will be managed more efficiently, and personalized education will adapt to each learner''s pace and style.

## Ethical Considerations

With great power comes great responsibility. As we embrace AI, we must also consider:

- **Privacy**: How much data are we willing to share?
- **Bias**: Ensuring AI systems are fair and inclusive
- **Transparency**: Understanding how AI makes decisions
- **Control**: Maintaining human oversight

## Conclusion

The key to successfully integrating AI into our lives is finding the right balance between convenience and control, between automation and autonomy. As these technologies continue to develop, staying informed and engaged will be crucial.

The future is here, and it''s powered by AI. The question isn''t whether we''ll use AI, but how we''ll use it responsibly to enhance our lives while maintaining our humanity.',
  'Technology',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
  150,
  0.92,
  'productive',
  '8 min read',
  12450,
  89,
  'Alex Thompson',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  24,
  '["AI", "Technology", "Future", "Innovation", "Productivity"]'
),
(
  'post-2',
  'Mindful Living in a Digital Age',
  'Finding balance and peace in our hyper-connected world.',
  '# The Art of Mindful Digital Living

In today''s hyper-connected world, finding moments of peace and mindfulness has become more important than ever. This guide explores practical strategies for maintaining mental wellness while navigating our digital landscape.

## Understanding Digital Overwhelm

The average person checks their phone 96 times per day. We''re constantly bombarded with notifications, updates, and information. This constant connectivity can lead to:

- Increased anxiety and stress
- Reduced attention span
- Sleep disruption
- Decreased productivity
- Weakened personal relationships

## Setting Boundaries

Creating healthy digital boundaries is essential:

**Morning Routine**: Start your day without immediately checking your phone. Give yourself at least 30 minutes of screen-free time.

**Designated Digital-Free Zones**: Keep bedrooms, dining areas, and certain spaces free from devices.

**Notification Management**: Turn off non-essential notifications. You don''t need to know every time someone likes your post.

## Mindful Consumption

Be intentional about your digital diet:

1. **Quality over Quantity**: Choose meaningful content over mindless scrolling
2. **Time Limits**: Set daily limits for social media apps
3. **Purpose-Driven Use**: Ask yourself why you''re picking up your phone
4. **Scheduled Checks**: Batch your social media time instead of constant checking

## The Power of Presence

Practice being fully present in the moment:

- **Single-Tasking**: Focus on one thing at a time
- **Mindful Breaks**: Take regular breaks to breathe and reset
- **Nature Time**: Spend time outdoors without devices
- **Deep Conversations**: Have phone-free conversations with loved ones

## Digital Detox Strategies

Regular digital detoxes can reset your relationship with technology:

- **Weekend Retreats**: Plan device-free weekends
- **Evening Wind-Down**: No screens 1-2 hours before bed
- **Vacation Boundaries**: Limit work communication during time off
- **Social Media Breaks**: Take periodic breaks from platforms

## Conclusion

Mindful digital living isn''t about rejecting technology—it''s about using it intentionally. By creating boundaries, being selective about consumption, and prioritizing real-world connections, we can enjoy the benefits of our digital age while protecting our mental health and well-being.

Remember: You control technology, not the other way around.',
  'Wellness',
  'https://images.unsplash.com/photo-1599036629621-07f8cb665695?w=800',
  120,
  0.89,
  'productive',
  '6 min read',
  8920,
  64,
  'Sarah Chen',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  18,
  '["Mindfulness", "Wellness", "Digital Health", "Balance", "Self-Care"]'
),
(
  'post-3',
  'The Power of Mindful Breathing',
  'Discover how 5 minutes of mindful breathing can transform your day and reduce stress.',
  '# The Power of Mindful Breathing

Mindful breathing is one of the simplest yet most powerful tools for managing stress and improving overall well-being. By focusing on your breath, you can calm your nervous system, reduce anxiety, and enhance your mental clarity.

## What is Mindful Breathing?

Mindful breathing involves paying close attention to your breath as it flows in and out. It''s about being fully present with each inhale and exhale, without trying to change or control the breathing pattern.

## The Science Behind It

When you practice mindful breathing:
- Your heart rate slows down
- Blood pressure decreases
- Stress hormones like cortisol are reduced
- The parasympathetic nervous system activates
- Brain waves shift to calmer patterns

## Simple Breathing Techniques

### 4-7-8 Breathing
1. Inhale through your nose for 4 seconds
2. Hold your breath for 7 seconds
3. Exhale slowly through your mouth for 8 seconds
4. Repeat 3-4 times

### Box Breathing
1. Inhale for 4 seconds
2. Hold for 4 seconds
3. Exhale for 4 seconds
4. Hold for 4 seconds
5. Repeat the cycle

## When to Practice

- **Morning**: Start your day with 5 minutes of breathing
- **Before meetings**: Calm your nerves
- **During stress**: Take a breathing break
- **Before sleep**: Wind down with gentle breaths

## Benefits Over Time

Regular practice of mindful breathing can lead to lasting improvements in emotional regulation, focus, sleep quality, and overall happiness. Just 5 minutes a day can make a significant difference.',
  'Wellness',
  'https://images.unsplash.com/photo-1764192114257-ae9ecf97eb6f?w=800',
  15,
  0.92,
  'productive',
  '4 min read',
  5600,
  42,
  'Maya Patel',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  15,
  '["Breathing", "Wellness", "Mindfulness", "Health", "Stress Relief"]'
),
(
  'post-4',
  'Mountain Meditation Retreat',
  'Find peace in nature with these stunning mountain meditation spots around the world.',
  '# Mountain Meditation: Finding Inner Peace at Altitude

Mountains have always been sacred spaces for meditation and spiritual practice. Their towering presence, clean air, and natural silence create the perfect environment for deep contemplation and inner peace.

## Why Mountains?

The altitude, the silence, and the visual grandeur of mountains naturally quiet the mind. Studies show that being in mountainous environments reduces cortisol levels by up to 25%.

## Top Mountain Meditation Spots

### Himalayas, Nepal
The birthplace of many meditation traditions. Monasteries perched on steep cliffs offer retreats for beginners and experienced practitioners alike.

### Swiss Alps
Combine the precision of European wellness culture with breathtaking alpine scenery for a unique meditation experience.

### Rocky Mountains, Colorado
Accessible retreats with modern amenities surrounded by pristine wilderness.

## How to Meditate in Nature

1. Find a comfortable spot with a view
2. Sit quietly and observe the landscape
3. Let the sounds of nature become your meditation bell
4. Breathe deeply and feel connected to the earth
5. Stay for at least 20 minutes

## Benefits of Outdoor Meditation

- Enhanced sense of connection to nature
- Deeper breathing due to fresh air
- Visual beauty reduces mental chatter
- Physical grounding through earth contact
- Natural sounds promote relaxation',
  'Travel',
  'https://images.unsplash.com/photo-1598439473183-42c9301db5dc?w=800',
  18,
  0.95,
  'productive',
  '5 min read',
  7200,
  53,
  'James Wilson',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  20,
  '["Travel", "Meditation", "Mountains", "Nature", "Retreats"]'
),
(
  'post-5',
  'Books That Changed My Life',
  '10 powerful books that will transform your perspective and enhance your personal growth.',
  '# Books That Changed My Life

Reading has the power to transform our thinking, expand our horizons, and reshape our understanding of the world. Here are 10 books that fundamentally changed my perspective.

## 1. Atomic Habits by James Clear
This book taught me that tiny changes lead to remarkable results. The idea of 1% improvement every day is incredibly powerful.

## 2. Sapiens by Yuval Noah Harari
Understanding human history from a 70,000-year perspective changes how you see everything—from religion to economics to technology.

## 3. The Power of Now by Eckhart Tolle
Living in the present moment is the key to inner peace. This book helped me stop overthinking and start experiencing life fully.

## 4. Deep Work by Cal Newport
In an age of constant distraction, the ability to focus deeply is a superpower. This book provides a framework for cultivating that skill.

## 5. Thinking, Fast and Slow by Daniel Kahneman
Understanding our two systems of thinking helps us make better decisions and avoid cognitive biases.

## 6. Man''s Search for Meaning by Viktor Frankl
Finding purpose even in the darkest circumstances. A profound reminder that we always have the freedom to choose our attitude.

## 7. The Alchemist by Paulo Coelho
Following your personal legend and trusting the journey. A beautiful story about pursuing your dreams.

## 8. Meditations by Marcus Aurelius
Ancient wisdom that''s still relevant today. Stoic philosophy for navigating life''s challenges with grace.

## 9. Mindset by Carol Dweck
The growth mindset vs. fixed mindset framework has changed how I approach challenges and learning.

## 10. Digital Minimalism by Cal Newport
A philosophy for using technology intentionally rather than letting it use you.

## How to Read More

- Set a daily reading goal (even 10 minutes counts)
- Keep a book with you at all times
- Replace social media time with reading
- Join a book club for accountability
- Take notes to deepen understanding',
  'Learning',
  'https://images.unsplash.com/photo-1608120663152-fe60f4f55fe3?w=800',
  25,
  0.91,
  'productive',
  '7 min read',
  9800,
  71,
  'David Park',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  22,
  '["Books", "Learning", "Personal Growth", "Reading", "Self-Improvement"]'
),
(
  'post-6',
  'Morning Workout Routine',
  'Start your day with this energizing 15-minute workout routine that requires no equipment.',
  '# The Ultimate 15-Minute Morning Workout

Starting your day with exercise sets the tone for everything that follows. This no-equipment routine is designed to energize your body and sharpen your mind in just 15 minutes.

## Why Morning Exercise?

- Boosts metabolism for the entire day
- Improves mood through endorphin release
- Enhances focus and mental clarity
- Builds consistent healthy habits
- Better sleep at night

## The Routine

### Warm-Up (2 minutes)
- Jumping jacks: 30 seconds
- Arm circles: 30 seconds
- High knees: 30 seconds
- Hip rotations: 30 seconds

### Main Workout (10 minutes)
1. **Push-ups**: 3 sets of 10 (modify on knees if needed)
2. **Squats**: 3 sets of 15
3. **Plank**: 3 holds of 30 seconds
4. **Lunges**: 3 sets of 10 each leg
5. **Burpees**: 3 sets of 5

### Cool Down (3 minutes)
- Standing hamstring stretch: 30 seconds each side
- Quad stretch: 30 seconds each side
- Child''s pose: 30 seconds
- Deep breathing: 30 seconds

## Tips for Success

- Lay out workout clothes the night before
- Start with easier modifications and progress
- Stay hydrated
- Be consistent—even on days you don''t feel like it
- Track your progress weekly',
  'Fitness',
  'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800',
  22,
  0.87,
  'neutral',
  '5 min read',
  6400,
  38,
  'Lisa Rodriguez',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  16,
  '["Fitness", "Workout", "Morning Routine", "Health", "Exercise"]'
);
