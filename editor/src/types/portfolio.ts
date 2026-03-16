export type ModuleType =
  | 'hero'
  | 'project-grid'
  | 'text'
  | 'use-case'
  | 'project-hero'
  | 'about'
  | 'image'
  | 'timeline'
  | 'two-column'
  | 'skills'
  | 'gallery'
  | 'divider'
  | 'cta-button';

export interface HeroData {
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaTarget: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  image: string;
  slug: string;
  status: 'published' | 'draft';
}

export interface ProjectGridData {
  heading: string;
  projects: ProjectItem[];
}

export interface TextData {
  label: string;
  heading: string;
  body: string;
}

export interface UseCaseData {
  label: string;
  heading: string;
  body: string;
  image: string;
  imagePosition?: 'left' | 'right';
}

export interface ProjectHeroData {
  title: string;
  category: string;
  year: string;
  image: string;
}

export interface AboutData {
  heading: string;
  body: string;
  image: string;
}

export interface ImageData {
  src: string;
  alt: string;
  caption?: string;
}

export interface TimelineItem {
  id: string;
  role: string;
  company: string;
  dates: string;
  description: string;
}

export interface TimelineData {
  heading: string;
  items: TimelineItem[];
}

export interface TwoColumnData {
  leftHeading: string;
  leftBody: string;
  rightHeading: string;
  rightBody: string;
}

export interface SkillGroup {
  id: string;
  label: string;
  items: string; // comma-separated tag list
}

export interface SkillsData {
  heading: string;
  groups: SkillGroup[];
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption: string;
}

export interface GalleryData {
  heading: string;
  images: GalleryImage[];
}

export interface DividerData {
  style: 'line' | 'space';
  size: 'sm' | 'md' | 'lg';
}

export interface CtaButtonData {
  label: string;
  url: string;
  style: 'primary' | 'outline';
  openNewTab: boolean;
}

export type ModuleData =
  | HeroData
  | ProjectGridData
  | TextData
  | UseCaseData
  | ProjectHeroData
  | AboutData
  | ImageData
  | TimelineData
  | TwoColumnData
  | SkillsData
  | GalleryData
  | DividerData
  | CtaButtonData;

export interface Module {
  id: string;
  type: ModuleType;
  data: ModuleData;
}

export interface ProjectDetail {
  id: string;
  title: string;
  category: string;
  year: string;
  image: string;
  badge?: 'featured' | 'archived' | 'coming-soon';
  passwordHash?: string;
  status: 'published' | 'draft';
  modules: Module[];
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  modules: Module[];
  projects?: ProjectDetail[];
}

export interface NavItem {
  id: string;
  label: string;
  slug: string;
  published: boolean;
}

export interface SiteInfo {
  title: string;
  author: string;
  tagline: string;
  darkMode?: boolean;
}

export interface PortfolioData {
  site: SiteInfo;
  navigation: NavItem[];
  pages: Page[];
}

export const MODULE_LABELS: Record<ModuleType, string> = {
  'hero': 'Hero',
  'project-grid': 'Project Grid',
  'text': 'Text Block',
  'use-case': 'Use Case',
  'project-hero': 'Project Hero',
  'about': 'About',
  'image': 'Image',
  'timeline': 'Timeline',
  'two-column': 'Two Column',
  'skills': 'Skills / Tags',
  'gallery': 'Gallery',
  'divider': 'Divider',
  'cta-button': 'CTA Button',
};

export const MODULE_DESCRIPTIONS: Record<ModuleType, string> = {
  'hero': 'Large heading with intro text and CTA',
  'project-grid': 'Grid of project thumbnails',
  'text': 'Labeled text block with heading and body',
  'use-case': 'Case study section with image',
  'project-hero': 'Project title, category, and hero image',
  'about': 'Bio section with photo',
  'image': 'Single image with optional caption',
  'timeline': 'Work history / experience list',
  'two-column': 'Side-by-side content columns',
  'skills': 'Grouped skill tags',
  'gallery': 'Grid of images',
  'divider': 'Horizontal rule or spacer',
  'cta-button': 'Call-to-action button (e.g. Download Resume)',
};

export const MODULE_COLORS: Record<ModuleType, string> = {
  'hero': 'bg-blue-100 text-blue-600',
  'project-grid': 'bg-purple-100 text-purple-600',
  'text': 'bg-gray-100 text-gray-500',
  'use-case': 'bg-orange-100 text-orange-600',
  'project-hero': 'bg-yellow-100 text-yellow-700',
  'about': 'bg-green-100 text-green-600',
  'image': 'bg-amber-100 text-amber-600',
  'timeline': 'bg-teal-100 text-teal-600',
  'two-column': 'bg-indigo-100 text-indigo-600',
  'skills': 'bg-pink-100 text-pink-600',
  'gallery': 'bg-cyan-100 text-cyan-600',
  'divider': 'bg-gray-100 text-gray-400',
  'cta-button': 'bg-red-100 text-red-500',
};

export function createDefaultModule(type: ModuleType): Module {
  const id = crypto.randomUUID();
  switch (type) {
    case 'hero':
      return { id, type, data: { heading: 'Your Heading Here', subheading: 'Add a compelling subtitle.', ctaLabel: 'View Work', ctaTarget: '#projects' } };
    case 'project-grid':
      return { id, type, data: { heading: 'Selected Work', projects: [] } };
    case 'text':
      return { id, type, data: { label: 'Overview', heading: 'Section Heading', body: '<p>Write your content here.</p>' } };
    case 'use-case':
      return { id, type, data: { label: 'Challenge', heading: 'Use Case Heading', body: '<p>Describe this use case.</p>', image: 'https://placehold.co/800x600/1a1a1a/ffffff?text=Image' } };
    case 'project-hero':
      return { id, type, data: { title: 'Project Title', category: 'Category', year: String(new Date().getFullYear()), image: 'https://placehold.co/1200x700/1a1a1a/ffffff?text=Project+Hero' } };
    case 'about':
      return { id, type, data: { heading: "I'm MH.", body: '<p>Tell your story here.</p>', image: 'https://placehold.co/600x800/1a1a1a/ffffff?text=Photo' } };
    case 'image':
      return { id, type, data: { src: 'https://placehold.co/1200x800/1a1a1a/ffffff?text=Image', alt: 'Image', caption: '' } };
    case 'timeline':
      return { id, type, data: { heading: 'Experience', items: [{ id: crypto.randomUUID(), role: 'Senior Designer', company: 'Company Name', dates: '2022 – Present', description: 'Brief description of your role and impact.' }] } };
    case 'two-column':
      return { id, type, data: { leftHeading: 'Skills', leftBody: '<p>List your skills here.</p>', rightHeading: 'About', rightBody: '<p>A brief introduction to complement the left column.</p>' } };
    case 'skills':
      return { id, type, data: { heading: 'Skills', groups: [{ id: crypto.randomUUID(), label: 'Design', items: 'Figma, Sketch, Illustrator, Photoshop' }, { id: crypto.randomUUID(), label: 'Research', items: 'User Interviews, Usability Testing, Journey Mapping' }] } };
    case 'gallery':
      return { id, type, data: { heading: '', images: [] } };
    case 'divider':
      return { id, type, data: { style: 'line', size: 'md' } };
    case 'cta-button':
      return { id, type, data: { label: 'Download Resume', url: '#', style: 'primary', openNewTab: true } };
  }
}
