import { redirect } from 'next/navigation';

export default function BidderPage({ params }: { params: { id: string; bidderId: string } }) {
  redirect('/tenders/' + params.id + '/bidders/' + params.bidderId + '/verification');
}
