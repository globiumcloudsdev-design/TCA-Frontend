/**
 * AvatarWithInitials — Avatar with Cloudinary image + initials fallback
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   src         string   image URL (optional)
 *   firstName   string
 *   lastName    string
 *   size        'sm'|'md'|'lg'|'xl'   default 'md'
 *   className   string
 *
 * Usage:
 *   <AvatarWithInitials src={student.photo_url} firstName="John" lastName="Doe" size="lg" />
 */
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

const SIZE_CLASSES = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export default function AvatarWithInitials({ src, firstName = '', lastName = '', size = 'md', className }) {
  return (
    <Avatar className={cn(SIZE_CLASSES[size], className)}>
      {src && <AvatarImage src={src} alt={`${firstName} ${lastName}`} />}
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {getInitials(firstName, lastName)}
      </AvatarFallback>
    </Avatar>
  );
}
