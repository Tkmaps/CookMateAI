"use client"

import React from "react"
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient"
import { styled } from "nativewind"

const StyledLinearGradient = styled(ExpoLinearGradient)

export const LinearGradient = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <StyledLinearGradient
        {...props}
        className={className}
        ref={ref}
      />
    )
  }
)

LinearGradient.displayName = "LinearGradient"; 