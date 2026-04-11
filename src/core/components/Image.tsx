import type { ImgHTMLAttributes } from 'react'

export type ImageProps = {
  src: string
  alt: string
  className?: string
} & ImgHTMLAttributes<HTMLImageElement>

export const Image = ({ src, alt, className, ...props }: ImageProps) => {
  return <img src={src} alt={alt} className={className} {...props} />
}
