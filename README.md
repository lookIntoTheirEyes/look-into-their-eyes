# Look Into Their Eyes Project Overview

## Project Description

"Look Into Their Eyes" is a bilingual (Hebrew/English) web exhibition showcasing the work of Israeli graffiti artist Benzi Brofman, with a focus on paintings created after the October 7th tragedy. The site serves as a memorial platform to raise awareness for the hostages taken during this event.

## Technical Stack

- **Framework**: Next.js (v15.3.0)
- **Languages**: TypeScript and React
- **Internationalization**: next-intl for seamless Hebrew/English support
- **Animation**: Framer Motion for smooth UI transitions
- **Responsive Design**: Custom mobile detection and responsive layouts

## Key Features

### Interactive Flip Book
The centerpiece of the application is a custom page-flipping book component that allows users to browse through stories of the victims and hostages. This feature includes:
- Realistic page-turning animations
- Responsive design that adapts to different screen sizes
- RTL (right-to-left) support for Hebrew text
- Touch and swipe gestures for mobile users

### Bilingual Support
The application fully supports both Hebrew and English:
- Automatic language detection
- User-selectable language switcher
- RTL layout for Hebrew content
- Custom font handling for both languages

### Accessibility Features
The site integrates comprehensive accessibility tools:
- Screen reader compatibility
- Text resizing options
- Color inversion capability
- Text-to-speech functionality
- Speech-to-text input support
- Animation disabling option for users with vestibular disorders

### Visitor Engagement
- Visitor's Book for comments and reflections
- Family Narratives section for more personal stories
- Email-based form submissions for moderation

### Content Management
- Dynamic content loading from JSON data sources
- Cloudinary integration for optimized image delivery
- Responsive image sizing based on viewport dimensions

### SEO and Performance
- Static site generation for optimal performance
- SEO metadata management
- Sitemap generation
- Robots.txt configuration

## Project Structure

```
src/
├── app/                  # Page definitions and routing (Next.js App Router)
├── components/           # Reusable React components
│   ├── Book/             # Flip book components
│   ├── FlipBook/         # Core page-flipping functionality
│   ├── CommentForm/      # User submission forms
│   └── ...
├── hooks/                # Custom React hooks
├── i18n/                 # Internationalization configuration
├── lib/                  # Shared utilities and models
│   ├── model/            # TypeScript interfaces and type definitions
│   └── utils/            # Helper functions
├── books/                # JSON data files for content
└── ...
```

## Deployment

The project is designed to be deployed on Vercel, with environment variables for:
- Cloudinary API credentials
- Resend email API keys
- Analytics configuration

## Contributing

This project serves as a memorial and awareness platform. For feature requests or bug reports, please reach out to the development team.

---

*"Look Into Their Eyes" is dedicated to increasing awareness about the hostages and preserving the memory of victims from the events of October 7th, 2023.*
