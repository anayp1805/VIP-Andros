# Tokuma

A sustainability-first platform connecting students, organizations, and philanthropists. Companies can list activities, philanthropists can fund projects, and users can learn and participate.

## Features

- **User Authentication**: Email/password authentication with Supabase Auth
- **Activity Browsing**: Search and filter activities by location, category, and price
- **Lodge Profiles**: Comprehensive accommodation profiles with room types, amenities, policies, and exclusive experiences
- **Real-time Booking**: Book available time slots with instant confirmation
- **Company Dashboard**: Companies and philanthropists can create, edit, and manage their activities
- **User Dashboard**: Users and philanthropists can view their booking history and upcoming activities
- **Philanthropy Section**: Invite-only collaboration space with events and forum placeholder
- **Projects**: Separate projects area for orgs to post impact work and students to apply
- **Responsive Design**: Mobile-first design that works on all devices
- **Image Upload**: Support for activity images with base64 encoding

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Language**: TypeScript
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ or Bun
- A Supabase account and project
- Git

## Installation

### Mac Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd VIP-Andros
   \`\`\`

2. **Install dependencies**
   
   Using npm:
   \`\`\`bash
   npm install
   \`\`\`
   
   Or using Bun (recommended):
   \`\`\`bash
   bun install
   \`\`\`

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   \`\`\`bash
   touch .env.local
   \`\`\`
   
   Add your Supabase credentials (get these from your Supabase project settings):
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
   \`\`\`


4. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   bun dev
   \`\`\`
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Windows Setup

1. **Clone the repository**
   \`\`\`cmd
   git clone <your-repo-url>
   cd activity-booking-platform
   \`\`\`

2. **Install dependencies**
   
   Using npm:
   \`\`\`cmd
   npm install
   \`\`\`
   
   Or using Bun (recommended):
   \`\`\`cmd
   bun install
   \`\`\`

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   \`\`\`cmd
   type nul > .env.local
   \`\`\`
   
   Open the file in your text editor and add your Supabase credentials:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
   \`\`\`

4. **Set up the database**
   
   Run the SQL scripts in the `scripts/` folder in order using the Supabase SQL Editor:
   - `001_initial_schema.sql`
   - `002_seed_data.sql` (optional)
   - `003_fix_company_name_visibility.sql`

5. **Run the development server**
   \`\`\`cmd
   npm run dev
   \`\`\`
   
   Or with Bun:
   \`\`\`cmd
   bun dev
   \`\`\`
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup Details

### Running SQL Scripts

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste each script from the `scripts/` folder
4. Run them in order (001, 002, 003)

### Database Schema

The application uses the following tables:
- **users**: Stores user accounts (name, email, user_type)
- **activities**: Stores activity listings with details, pricing, and images
- **availability_slots**: Stores time slots for each activity
- **bookings**: Stores booking records

### Row Level Security (RLS)

RLS policies are enabled to ensure:
- Users can only view and edit their own bookings
- Companies can only edit their own activities
- Anonymous users can view activities and company names
- Authenticated users can create bookings

## Usage

### For Users

1. **Sign Up**: Create an account as a "User"
2. **Browse Activities**: Search and filter activities on the homepage
3. **Book Activity**: Select an activity, choose a date and time slot, and confirm booking
4. **View Bookings**: Check your dashboard for upcoming and past bookings

### For Companies

1. **Sign Up**: Create an account as a "Company"
2. **Create Activity**: Add a new activity with details, pricing, and images
3. **Manage Activities**: Edit or delete your activities from the dashboard
4. **View Bookings**: See who has booked your activities

### For Lodges

1. **Sign Up**: Create an account as a "Company"
2. **Set Business Type**: Choose "Lodge" as your business type
3. **Create Profile**: Fill out comprehensive lodge profile with:
   - Room types and configurations
   - Amenities (WiFi, Pool, Restaurant, etc.)
   - Policies (check-in/out, cancellation, house rules)
   - Image gallery (10-20 images recommended)
   - External booking link (ResNexus, Cloudbeds, Airbnb, etc.)
4. **Add Experiences**: Create lodge-specific experiences (spa, dinners, activities)
5. **Manage Profile**: Update your lodge information from the dashboard

## Lodge Feature

The platform now supports comprehensive lodge/accommodation profiles with the following capabilities:

### Lodge Profiles Include:
- **Room Types**: Multiple room configurations with individual amenities
- **Amenities**: Lodge-wide amenities (Free WiFi, Pool, Beach Access, etc.)
- **Policies**: Check-in/out times, cancellation policy, minimum stay, house rules
- **Image Gallery**: Multiple images showcasing the property
- **External Booking**: Integration with booking systems (ResNexus, Cloudbeds, Airbnb)
- **Our Story**: Rich narrative section with images
- **Contact Info**: Email, phone, address, website, blog

### Activity Types:
- **General Activities**: Public activities shown on main activities page
- **Lodge Experiences**: Exclusive experiences shown only on the lodge's profile page (e.g., spa treatments, private dinners, room upgrades)

### How to Set Up a Lodge:
1. Run database migration: `scripts/004_add_lodge_fields.sql` in Supabase SQL Editor
2. Sign up as a Company
3. Navigate to your profile/dashboard
4. Set business type to "Lodge"
5. Fill out the lodge profile form
6. Add room types with amenities
7. Upload images (first image becomes cover photo)
8. Set policies and contact information
9. Optionally create lodge experiences

For detailed implementation information, see `LODGE_FEATURE_IMPLEMENTATION.md`.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Supabase Configuration for Production

1. In your Supabase dashboard, go to Authentication → URL Configuration
2. Add your production domain to the allowed redirect URLs:
   - `https://yourdomain.com`
   - `https://yourdomain.com/auth/callback`

## Troubleshooting

### Images not persisting after reload
- Make sure you're uploading images through the file input (not just URLs)
- Images are converted to base64 and stored in the database

### "Unknown Company" showing for activities
- Run the `003_fix_company_name_visibility.sql` script
- This updates RLS policies to allow anonymous users to read company names

### Authentication errors
- Check that your Supabase environment variables are correct
- Ensure redirect URLs are configured in Supabase dashboard

### Database connection issues
- Verify your Supabase project is active
- Check that RLS policies are enabled
- Ensure SQL scripts have been run in order

## Development

### Project Structure

\`\`\`
├── app/                    # Next.js app router pages
├── components/             # React components
├── lib/                    # Utilities and contexts
│   ├── supabase/          # Supabase client configuration
│   ├── auth-context.tsx   # Authentication context
│   └── activities-context.tsx # Activities data management
├── scripts/               # Database SQL scripts
└── public/                # Static assets
\`\`\`

### Key Files

- `lib/supabase/client.ts` - Supabase client for browser
- `lib/supabase/server.ts` - Supabase client for server
- `lib/auth-context.tsx` - Authentication state management
- `lib/activities-context.tsx` - Activities CRUD operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions, please open an issue on GitHub or contact the development team.
