export default function LoadingSpinner() {
    return (
        <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Lade...</p>
        </div>
    );
}
