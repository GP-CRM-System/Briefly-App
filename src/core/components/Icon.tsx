import type { FC, SVGProps } from 'react'

export type IconProps = {
    icon: FC<SVGProps<SVGSVGElement>>
    className?: string
} & SVGProps<SVGSVGElement>

export const Icon = ({ icon: IconComponent, className, ...props }: IconProps) => {
    return <IconComponent className={className} {...props} />
}
