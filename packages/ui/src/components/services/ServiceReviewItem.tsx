import type { ServiceReview } from '../../api/services'

interface ServiceReviewItemProps {
  review: ServiceReview
}

export function ServiceReviewItem({ review }: ServiceReviewItemProps) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
          {review.reviewerAccountId}
        </span>
        <div className="flex items-center gap-1">
          <span style={{ fontSize: 11, color: 'var(--warning)' }}>
            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
          </span>
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
        {review.comment}
      </p>
      <span style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4, display: 'block' }}>
        {new Date(review.createdAt).toLocaleDateString()}
      </span>
    </div>
  )
}
