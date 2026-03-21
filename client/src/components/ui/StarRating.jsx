import { useState } from 'react'
import { Star } from 'lucide-react'

const StarRating = ({ value = 0, onChange, readonly = false, size = 20, className = '' }) => {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-all duration-100 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            size={size}
            className={`transition-colors duration-100 ${display >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
          />
        </button>
      ))}
    </div>
  )
}

export default StarRating
