import React from 'react'
import { useProfileCompletionModal } from '../../hooks/useProfileCompletionModal'

function Partner() {
  // Check for missing email and show modal after 5 seconds
  const { ModalComponent } = useProfileCompletionModal()

  return (
    <>
      {/* Profile Completion Modal - Shows after 5 seconds for users without email */}
      {ModalComponent}
      
      <div>
        
      </div>
    </>
  )
}

export default Partner
